/**
 * based of @link https://github.com/eslint/eslint-plugin-markdown/blob/main/lib/processor.js
 *
 * @fileoverview Processes Markdown files for consumption by ESLint.
 * @author Brandon Mills
 */

import type { Linter } from 'eslint'
import type { Node, Parent } from 'unist'

import { remarkProcessor } from '../rules'

import type { ESLintProcessor, ESLinterProcessorFile } from './types'

export interface Block extends Node {
  baseIndentText: string
  comments: string[]
  rangeMap: Array<{ js: number; md: number }>
}

const UNSATISFIABLE_RULES = new Set([
  'eol-last', // The Markdown parser strips trailing newlines in code fences
  'unicode-bom', // Code blocks will begin in the middle of Markdown files
])
const SUPPORTS_AUTOFIX = true

const blocksCache: Record<string, Block[]> = {}

/**
 * Performs a depth-first traversal of the Markdown AST.
 * @param node A Markdown AST node.
 * @param callbacks A map of node types to callbacks.
 * @param parent The node's parent AST node.
 */
function traverse(
  node: Node,
  callbacks: { [key: string]: (node: Node, parent: Parent) => void },
  parent?: Parent,
): void {
  if (callbacks[node.type]) {
    callbacks[node.type](node, parent)
  }

  if (typeof node.children !== 'undefined') {
    const parent = node as Parent
    for (const child of parent.children) {
      traverse(child, callbacks, parent)
    }
  }
}

/**
 * Converts leading HTML comments to JS block comments.
 * @param html The text content of an HTML AST node.
 * @returns JS block comment.
 */
function getComment(html: string): string {
  const commentStart = '<!--'
  const commentEnd = '-->'
  const regex = /^(eslint\b|global\s)/u

  if (
    html.slice(0, commentStart.length) !== commentStart ||
    html.slice(-commentEnd.length) !== commentEnd
  ) {
    return ''
  }

  const comment = html.slice(commentStart.length, -commentEnd.length)

  if (!regex.test(comment.trim())) {
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
function getBeginningOfLineOffset(node: Node): number {
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
function getIndentText(text: string, node: Node): string {
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
function getBlockRangeMap(
  text: string,
  node: Node,
  comments: string[],
): Array<{ js: number; md: number }> {
  /*
   * The parser sets the fenced code block's start offset to wherever content
   * should normally begin (typically the first column of the line, but more
   * inside a list item, for example). The code block's opening fancy may be
   * further indented by up to three characters. If the code block has
   * additional indenting, the opening fence's first backtick may be up to
   * three whitespace characters after the start offset.
   */
  const startOffset = getBeginningOfLineOffset(node)

  /*
   * Extract the Markdown source to determine the leading whitespace for each
   * line.
   */
  const code = text.slice(startOffset, node.position.end.offset)
  const lines = code.split('\n')

  /*
   * The parser trims leading whitespace from each line of code within the
   * fenced code block up to the opening fence's first backtick. The first
   * backtick's column is the AST node's starting column plus any additional
   * indentation.
   */
  const baseIndent = getIndentText(text, node).length

  /*
   * Track the length of any inserted configuration comments at the beginning
   * of the linted JS and start the JS offset lookup keys at this index.
   */
  const commentLength = comments.reduce(
    (len, comment) => len + comment.length + 1,
    0,
  )

  /*
   * In case there are configuration comments, initialize the map so that the
   * first lookup index is always 0. If there are no configuration comments,
   * the lookup index will also be 0, and the lookup should always go to the
   * last range that matches, skipping this initialization entry.
   */
  const rangeMap = [
    {
      js: 0,
      md: 0,
    },
  ]

  // Start the JS offset after any configuration comments.
  let jsOffset = commentLength

  /*
   * Start the Markdown offset at the beginning of the block's first line of
   * actual code. The first line of the block is always the opening fence, so
   * the code begins on the second line.
   */
  let mdOffset = startOffset + lines[0].length + 1

  /*
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

/**
 * Extracts lintable JavaScript code blocks from Markdown text.
 * @param text The text of the file.
 * @param filename The filename of the file
 * @returns Source code strings to lint.
 */
function preprocess(text: string, filename: string): ESLinterProcessorFile[] {
  const ast = remarkProcessor.parse(text)
  const blocks: Block[] = []

  blocksCache[filename] = blocks

  traverse(ast, {
    code(node, parent) {
      const comments: string[] = []

      if (node.lang) {
        let index = parent.children.indexOf(node) - 1
        let previousNode = parent.children[index]

        while (previousNode && previousNode.type === 'html') {
          const comment = getComment(previousNode.value as string)

          if (!comment) {
            break
          }

          if (comment.trim() === 'eslint-skip') {
            return
          }

          comments.unshift(`/*${comment}*/`)
          index--
          previousNode = parent.children[index]
        }

        blocks.push({
          ...node,
          baseIndentText: getIndentText(text, node),
          comments,
          rangeMap: getBlockRangeMap(text, node, comments),
        })
      }
    },
  })

  return blocks.map((block, index) => ({
    filename: `${index}.${block.lang as string}`,
    text: [...block.comments, block.value, ''].join('\n'),
  }))
}

/**
 * Creates a map function that adjusts messages in a code block.
 * @param block A code block.
 * @returns A function that adjusts messages in a code block.
 */
function adjustBlock(
  block: Block,
): (message: Linter.LintMessage) => Linter.LintMessage {
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
  return function adjustMessage(message) {
    const lineInCode = message.line - leadingCommentLines

    if (lineInCode < 1) {
      return null
    }

    const out = {
      line: lineInCode + blockStart,
      column: message.column + block.position.indent[lineInCode - 1] - 1,
    } as Linter.LintMessage

    /* istanbul ignore else */
    if (Number.isInteger(message.endLine)) {
      out.endLine = message.endLine - leadingCommentLines + blockStart
    }

    const adjustedFix = {} as Linter.LintMessage

    /* istanbul ignore else */
    if (message.fix) {
      adjustedFix.fix = {
        range: message.fix.range.map(range => {
          // Advance through the block's range map to find the last
          // matching range by finding the first range too far and
          // then going back one.
          let i = 1

          while (i < block.rangeMap.length && block.rangeMap[i].js <= range) {
            i++
          }

          // Apply the mapping delta for this range.
          return range + block.rangeMap[i - 1].md
        }) as [number, number],
        text: message.fix.text.replace(/\n/gu, `\n${block.baseIndentText}`),
      }
    }

    return { ...message, ...out, ...adjustedFix }
  }
}

/**
 * Excludes unsatisfiable rules from the list of messages.
 * @param message A message from the linter.
 * @returns True if the message should be included in output.
 */
function excludeUnsatisfiableRules(message: Linter.LintMessage): boolean {
  return message && !UNSATISFIABLE_RULES.has(message.ruleId)
}

/**
 * Transforms generated messages for output.
 * @param messages An array containing one array of messages for each code block returned from `preprocess`.
 * @param filename The filename of the file
 * @returns A flattened array of messages with mapped locations.
 */
function postprocess(
  messages: Linter.LintMessage[][],
  filename: string,
): Linter.LintMessage[] {
  const blocks = blocksCache[filename] || []

  // eslint-disable-next-line unicorn/prefer-spread
  return ([] as Linter.LintMessage[]).concat(
    ...messages.map((group, i) => {
      const block = blocks[i]

      // non code block message, parsed by `eslint-mdx` for example
      if (!block) {
        return group
      }

      const adjust = adjustBlock(block)

      return group.map(adjust).filter(excludeUnsatisfiableRules)
    }),
  )
}

export const markdown: ESLintProcessor<ESLinterProcessorFile> = {
  preprocess,
  postprocess,
  supportsAutofix: SUPPORTS_AUTOFIX,
}
