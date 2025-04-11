/**
 * {@link https://github.com/eslint/markdown/blob/f17311eb250fe3f41a24fd52be9c6713d12b7d67/src/processor.js}
 */

import type { AST, Linter, Rule } from 'eslint'
import type { Node, Parent, Nodes, Root, RootContentMap } from 'mdast'
import type { MdxFlowExpression, MdxTextExpression } from 'mdast-util-mdx'

import { fromMarkdown } from '../from-markdown.js'
import { meta } from '../meta.js'

import type { CodeBlock, RangeMap } from './types.js'

const UNSATISFIABLE_RULES = new Set([
  'eol-last', // The Markdown parser strips trailing newlines in code fences
  'unicode-bom', // Code blocks will begin in the middle of Markdown files
])
const SUPPORTS_AUTOFIX = true

const BOM = '\uFEFF'

const blocksCache: Map<string, CodeBlock[]> = new Map()

/**
 * Performs a depth-first traversal of the Markdown AST.
 * @param node A Markdown AST node.
 * @param callbacks A map of node types to callbacks.
 */
function traverse(
  node: Nodes,
  callbacks: {
    [T in Nodes['type']]?: (
      node?: T extends keyof RootContentMap ? RootContentMap[T] : Root,
    ) => void
  } & { '*': () => void },
) {
  if (callbacks[node.type]) {
    callbacks[node.type](node as never)
  } else {
    callbacks['*']()
  }

  const parent = node as Parent

  if ('children' in parent) {
    for (const child of parent.children) {
      traverse(child, callbacks)
    }
  }
}

const COMMENTS = [
  [
    /^<!-{2,}/,
    // eslint-disable-next-line sonarjs/slow-regex
    /-{2,}>$/,
  ],
  [
    /^\/\*+/,
    // eslint-disable-next-line sonarjs/slow-regex
    /\*+\/$/,
  ],
] as const

const eslintCommentRegex = /^(?:eslint\b|global\s)/u

/**
 * Extracts `eslint-*` or `global` comments from HTML/MDX comments if present.
 * @param value The text content of an HTML/MDX AST node.
 * @returns The comment's text without the opening and closing tags or
 *     an empty string if the text is not an ESLint HTML/MDX comment.
 */
function getComment(value: string, isMdx = false) {
  const [commentStart, commentEnd] = COMMENTS[+isMdx]

  const commentStartMatched = commentStart.exec(value)
  const commentEndMatched = commentEnd.exec(value)

  if (commentStartMatched == null || commentEndMatched == null) {
    return ''
  }

  const comment = value
    .slice(commentStartMatched[0].length, -commentEndMatched[0].length)
    .trim()

  if (!eslintCommentRegex.test(comment)) {
    return ''
  }

  return comment
}

// Before a code block, blockquote characters (`>`) are also considered
// "whitespace".
const leadingWhitespaceRegex = /^[>\s]*/u

/**
 * Gets the offset for the first column of the node's first line in the
 * original source text.
 * @param node A Markdown code block AST node.
 * @returns The offset for the first column of the node's first line.
 */
function getBeginningOfLineOffset(node: Node) {
  return node.position.start.offset - node.position.start.column + 1
}

/**
 * Gets the leading text, typically whitespace with possible blockquote chars,
 * used to indent a code block.
 * @param text The text of the file.
 * @param node A Markdown code block AST node.
 * @returns The text from the start of the first line to the opening
 *     fence of the code block.
 */
function getIndentText(text: string, node: Node) {
  return leadingWhitespaceRegex.exec(
    text.slice(getBeginningOfLineOffset(node)),
  )[0]
}

/**
 * When applying fixes, the postprocess step needs to know how to map fix ranges
 * from their location in the linted JS to the original offset in the Markdown.
 * Configuration comments and indentation trimming both complicate this process.
 *
 * Configuration comments appear in the linted JS but not in the Markdown code
 * block. Fixes to configuration comments would cause undefined behavior and
 * should be ignored during postprocessing. Fixes to actual code after
 * configuration comments need to be mapped back to the code block after
 * removing any offset due to configuration comments.
 *
 * Fenced code blocks can be indented by up to three spaces at the opening
 * fence. Inside of a list, for example, this indent can be in addition to the
 * indent already required for list item children. Leading whitespace inside
 * indented code blocks is trimmed up to the level of the opening fence and does
 * not appear in the linted code. Further, lines can have less leading
 * whitespace than the opening fence, so not all lines are guaranteed to have
 * the same column offset as the opening fence.
 *
 * The source code of a non-configuration-comment line in the linted JS is a
 * suffix of the corresponding line in the Markdown code block. There are no
 * differences within the line, so the mapping need only provide the offset
 * delta at the beginning of each line.
 * @param text The text of the file.
 * @param node A Markdown code block AST node.
 * @param comments List of configuration comment strings that will be
 *     inserted at the beginning of the code block.
 * @returns A list of offset-based adjustments, where lookups are
 *     done based on the `js` key, which represents the range in the linted JS,
 *     and the `md` key is the offset delta that, when added to the JS range,
 *     returns the corresponding location in the original Markdown source.
 */
function getBlockRangeMap(text: string, node: Node, comments: string[]) {
  /**
   * The parser sets the fenced code block's start offset to wherever content
   * should normally begin (typically the first column of the line, but more
   * inside a list item, for example). The code block's opening fence may be
   * further indented by up to three characters. If the code block has
   * additional indenting, the opening fence's first backtick may be up to
   * three whitespace characters after the start offset.
   */
  const startOffset = getBeginningOfLineOffset(node)

  /**
   * Extract the Markdown source to determine the leading whitespace for each
   * line.
   */
  const code = text.slice(startOffset, node.position.end.offset)
  const lines = code.split('\n')

  /**
   * The parser trims leading whitespace from each line of code within the
   * fenced code block up to the opening fence's first backtick. The first
   * backtick's column is the AST node's starting column plus any additional
   * indentation.
   */
  const baseIndent = getIndentText(text, node).length

  /**
   * Track the length of any inserted configuration comments at the beginning
   * of the linted JS and start the JS offset lookup keys at this index.
   */
  const commentLength = comments.reduce(
    (len, comment) => len + comment.length + 1,
    0,
  )

  /**
   * In case there are configuration comments, initialize the map so that the
   * first lookup index is always 0. If there are no configuration comments,
   * the lookup index will also be 0, and the lookup should always go to the
   * last range that matches, skipping this initialization entry.
   */
  const rangeMap: RangeMap[] = [
    {
      indent: baseIndent,
      js: 0,
      md: 0,
    },
  ]

  // Start the JS offset after any configuration comments.
  let jsOffset = commentLength

  /**
   * Start the Markdown offset at the beginning of the block's first line of
   * actual code. The first line of the block is always the opening fence, so
   * the code begins on the second line.
   */
  let mdOffset = startOffset + lines[0].length + 1

  /**
   * For each line, determine how much leading whitespace was trimmed due to
   * indentation. Increase the JS lookup offset by the length of the line
   * post-trimming and the Markdown offset by the total line length.
   */
  for (let i = 0; i + 1 < lines.length; i++) {
    const line = lines[i + 1]
    const leadingWhitespaceLength = leadingWhitespaceRegex.exec(line)[0].length

    // The parser trims leading whitespace up to the level of the opening
    // fence, so keep any additional indentation beyond that.
    const trimLength = Math.min(baseIndent, leadingWhitespaceLength)

    rangeMap.push({
      indent: trimLength,
      js: jsOffset,

      // Advance `trimLength` character from the beginning of the Markdown
      // line to the beginning of the equivalent JS line, then compute the
      // delta.
      md: mdOffset + trimLength - jsOffset,
    })

    // Accumulate the current line in the offsets, and don't forget the
    // newline.
    mdOffset += line.length + 1
    jsOffset += line.length - trimLength + 1
  }

  return rangeMap
}

const codeBlockFileNameRegex =
  /filename=(?<quote>["'])(?<filename>.*?)\k<quote>/u

/**
 * Parses the file name from a block meta, if available.
 * @param block A code block.
 * @returns The filename, if parsed from block meta.
 */
function fileNameFromMeta(block: CodeBlock) {
  // istanbul ignore next
  return codeBlockFileNameRegex
    .exec(block.meta)
    ?.groups.filename.replaceAll(/\s+/gu, '_')
}

/**
 * Extracts lintable code blocks from Markdown text.
 * @param sourceText The text of the file.
 * @param filename The filename of the file
 * @returns Source code blocks to lint.
 */

function preprocess(sourceText: string, filename: string) {
  // istanbul ignore next
  const text = sourceText.startsWith(BOM) ? sourceText.slice(1) : sourceText
  const ast = fromMarkdown(
    text,
    // FIXME: how to read `extensions` and `markdownExtensions` parser options?
    filename.endsWith('.mdx'),
  )
  const blocks: CodeBlock[] = []

  blocksCache.set(filename, blocks)

  /**
   * During the depth-first traversal, keep track of any sequences of HTML/MDX
   * comment nodes containing `eslint-*` or `global` comments. If a code
   * block immediately follows such a sequence, insert the comments at the
   * top of the code block. Any non-ESLint comment or other node type breaks
   * and empties the sequence.
   */
  let allComments: string[] = []

  function mdxExpression(node: MdxFlowExpression | MdxTextExpression) {
    const comment = getComment(node.value, true)
    if (comment) {
      allComments.push(comment)
    } else {
      allComments = []
    }
  }

  traverse(ast, {
    '*'() {
      allComments = []
    },

    /**
     * Visit a code node.
     * @param node The visited node.
     */
    code(node) {
      if (!node.lang) {
        return
      }

      const comments: string[] = []

      for (const comment of allComments) {
        if (comment === 'eslint-skip') {
          allComments = []
          return
        }

        comments.push(`/* ${comment} */`)
      }

      allComments = []

      blocks.push({
        ...node,
        baseIndentText: getIndentText(text, node),
        comments,
        rangeMap: getBlockRangeMap(text, node, comments),
      })
    },

    /**
     * Visit an HTML node.
     * @param node The visited node.
     */
    html(node) {
      const comment = getComment(node.value)
      if (comment) {
        allComments.push(comment)
      } else {
        allComments = []
      }
    },

    mdxFlowExpression: mdxExpression,
    mdxTextExpression: mdxExpression,
  })

  return blocks.map((block, index) => {
    const [language] = block.lang.trim().split(' ')
    return {
      filename: fileNameFromMeta(block) ?? `${index}.${language}`,
      text: [...block.comments, block.value, ''].join('\n'),
    }
  })
}

/**
 * Adjusts a fix in a code block.
 * @param block A code block.
 * @param fix A fix to adjust.
 * @returns The fix with adjusted ranges.
 */
function adjustFix(block: CodeBlock, fix: Rule.Fix): Rule.Fix {
  return {
    range: fix.range.map(range => {
      // Advance through the block's range map to find the last
      // matching range by finding the first range too far and
      // then going back one.
      let i = 1

      while (i < block.rangeMap.length && block.rangeMap[i].js <= range) {
        i++
      }

      // Apply the mapping delta for this range.
      return range + block.rangeMap[i - 1].md
    }) as AST.Range,
    text: fix.text.replaceAll('\n', `\n${block.baseIndentText}`),
  }
}

/**
 * Creates a map function that adjusts messages in a code block.
 * @param block A code block.
 * @returns A function that adjusts messages in a code block.
 */
function adjustBlock(block: CodeBlock) {
  const leadingCommentLines = block.comments.reduce(
    (count, comment) => count + comment.split('\n').length,
    0,
  )

  const blockStart = block.position.start.line

  /**
   * Adjusts ESLint messages to point to the correct location in the Markdown.
   * @param message A message from ESLint.
   * @returns The same message, but adjusted to the correct location.
   */
  return function adjustMessage(
    message: Linter.LintMessage,
  ): Linter.LintMessage {
    // istanbul ignore if
    if (!Number.isInteger(message.line)) {
      return {
        ...message,
        line: blockStart,
        column: block.position.start.column,
      }
    }

    const lineInCode = message.line - leadingCommentLines

    // istanbul ignore if
    if (lineInCode < 1 || lineInCode >= block.rangeMap.length) {
      return null
    }

    const out: Partial<Linter.LintMessage> = {
      line: lineInCode + blockStart,
      column: message.column + block.rangeMap[lineInCode].indent,
    }

    // istanbul ignore if
    if (Number.isInteger(message.endLine)) {
      out.endLine = message.endLine - leadingCommentLines + blockStart
    }

    // istanbul ignore if
    if (Array.isArray(message.suggestions)) {
      out.suggestions = message.suggestions.map(suggestion => ({
        ...suggestion,
        fix: adjustFix(block, suggestion.fix),
      }))
    }

    const adjustedFix: Partial<Linter.LintMessage> = {}

    if (message.fix) {
      adjustedFix.fix = adjustFix(block, message.fix)
    }

    return { ...message, ...out, ...adjustedFix }
  }
}

/**
 * Excludes unsatisfiable rules from the list of messages.
 * @param message A message from the linter.
 * @returns True if the message should be included in output.
 */
function excludeUnsatisfiableRules(message: Linter.LintMessage) {
  return message && !UNSATISFIABLE_RULES.has(message.ruleId)
}

/**
 * Transforms generated messages for output.
 * @param messages An array containing one array of messages
 *     for each code block returned from `preprocess`.
 * @param filename The filename of the file
 * @returns A flattened array of messages with mapped locations.
 */
function postprocess(messages: Linter.LintMessage[][], filename: string) {
  const blocks = blocksCache.get(filename)

  blocksCache.delete(filename)

  return messages.flatMap((group, i) => {
    const adjust = adjustBlock(blocks[i])
    return group.map(adjust).filter(excludeUnsatisfiableRules)
  })
}

export const markdownProcessor = {
  meta: {
    name: 'mdx/markdown',
    version: meta.version,
  },
  preprocess,
  postprocess,
  supportsAutofix: SUPPORTS_AUTOFIX,
}
