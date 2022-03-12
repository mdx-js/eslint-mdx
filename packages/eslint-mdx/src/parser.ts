import path from 'path'

import type { ExpressionStatement } from '@babel/types'
import type { AST, Linter } from 'eslint'

import {
  arrayify,
  getPositionAt,
  hasProperties,
  isJsxNode,
  last,
  normalizeParser,
  normalizePosition,
  restoreNodeLocation,
} from './helpers'
import { getPhysicalFilename, getRemarkProcessor } from './processor'
import {
  COMMENT_CONTENT_REGEX,
  COMMENT_CONTENT_REGEX_GLOBAL,
  isComment,
} from './regexp'
import { traverse } from './traverse'
import type {
  Comment,
  LocationError,
  Node,
  Parent,
  ParserFn,
  ParserOptions,
  ParserServices,
} from './types'

export const AST_PROPS = ['body', 'comments', 'tokens'] as const
export const ES_NODE_TYPES: readonly string[] = ['export', 'import', 'jsx']

export const LOC_ERROR_PROPERTIES = ['column', 'lineNumber'] as const

export const DEFAULT_EXTENSIONS: readonly string[] = ['.mdx']
export const MARKDOWN_EXTENSIONS: readonly string[] = ['.md']

export const PLACEHOLDER_FILE_PATH = '__placeholder__.mdx'

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  comment: true,
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion:
    new Date().getUTCFullYear() as Linter.ParserOptions['ecmaVersion'],
  sourceType: 'module',
  tokens: true,
  filePath: PLACEHOLDER_FILE_PATH,
  // required for @typescript-eslint/parser
  // reference: https://github.com/typescript-eslint/typescript-eslint/pull/2028
  loc: true,
  range: true,
}

const JSX_WRAPPER_START = '<$>'
const JSX_WRAPPER_END = '</$>'
const OFFSET = JSX_WRAPPER_START.length

export class Parser {
  // @internal
  private _parsers: ParserFn[]

  // @internal
  private _ast: AST.Program

  // @internal
  private _services: ParserServices

  // @internal
  private readonly _options = DEFAULT_PARSER_OPTIONS

  constructor() {
    this.parse = this.parse.bind(this)
    this.parseForESLint = this.parseForESLint.bind(this)
  }

  normalizeJsxNode(node: Node, parent?: Parent, options = this._options) {
    const value = node.value

    if (node.type !== 'jsx' || isComment(value)) {
      return node
    }

    const commentContent = COMMENT_CONTENT_REGEX.exec(value)

    if (commentContent) {
      const comments: Comment[] = []
      const {
        position: {
          start: { line, column, offset: startOffset },
        },
        data,
      } = node

      Object.assign(node, {
        data: {
          ...data,
          jsxType: 'JSXElementWithHTMLComments',
          comments,
          // jsx in paragraph is considered as plain html in mdx, what means html style comments are valid
          // TODO: in this case, jsx style comments could be a mistake
          inline: !!parent && parent.type !== 'root',
        },
        value: value.replace(
          COMMENT_CONTENT_REGEX_GLOBAL,
          (
            matched: string,
            $0: string,
            $1: string,
            $2: string,
            offset: number,
          ) => {
            const endOffset = offset + matched.length
            const startLines = value.slice(0, offset).split('\n')
            const endLines = value.slice(0, endOffset).split('\n')
            const fixed = `{/${'*'.repeat($0.length - 2)}${$1}${'*'.repeat(
              $2.length - 2,
            )}/}`
            const startLineOffset = startLines.length - 1
            const endLineOffset = endLines.length - 1
            comments.push({
              fixed,
              // ! eslint ast column is 0-indexed, but unified is 1-indexed
              loc: {
                start: {
                  line: line + startLineOffset,
                  column:
                    last(startLines).length +
                    (startLineOffset ? 0 : column - 1),
                  offset: startOffset + offset,
                },
                end: {
                  line: line + endLineOffset,
                  column:
                    last(endLines).length + (endLineOffset ? 0 : column - 1),
                  offset: startOffset + endOffset,
                },
              },
              origin: matched,
            })
            return fixed
          },
        ),
      })
    }

    return this._normalizeJsxNodes(node, options)
  }

  parse(code: string, options: ParserOptions) {
    return this.parseForESLint(code, options).ast
  }

  parseForESLint(code: string, options: ParserOptions) {
    const extname = path.extname(options.filePath)
    const isMdx = [
      ...DEFAULT_EXTENSIONS,
      ...(options.extensions || []),
    ].includes(extname)
    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...(options.markdownExtensions || []),
    ].includes(extname)
    if (!isMdx && !isMarkdown) {
      return this._eslintParse(code, options)
    }

    const root = getRemarkProcessor(
      getPhysicalFilename(options.filePath),
      isMdx,
      Boolean(options.ignoreRemarkConfig),
    ).parse(code) as Parent

    this._ast = {
      ...normalizePosition(root.position),
      type: 'Program',
      sourceType: options.sourceType || 'module',
      body: [],
      comments: [],
      tokens: [],
    }

    this._services = {
      JSXElementsWithHTMLComments: [],
    }

    if (isMdx) {
      traverse(root, {
        code,
        enter: (node, parent) => {
          if (!ES_NODE_TYPES.includes(node.type)) {
            return
          }

          for (const normalizedNode of arrayify(
            this.normalizeJsxNode(node, parent, options),
          )) {
            this._nodeToAst(code, normalizedNode, options)
          }
        },
      })
    }

    return {
      ast: this._ast,
      services: this._services,
    } as Linter.ESLintParseResult
  }

  // @internal
  private _eslintParse(code: string, options: ParserOptions) {
    if (!this._parsers || options.parser !== this._options.parser) {
      this._parsers = normalizeParser(options.parser)
    }

    /* istanbul ignore else */
    if (options.filePath && this._options !== options) {
      Object.assign(this._options, options)
    }

    let program: ReturnType<ParserFn>
    let parseError: Error
    for (const parser of this._parsers) {
      try {
        program = parser(code, this._options)
        break
      } catch (err) {
        if (!parseError) {
          parseError = err as Error
        }
      }
    }

    if (!program && parseError) {
      throw parseError
    }

    /* istanbul ignore next */
    return (
      'ast' in program && program.ast ? program : { ast: program }
    ) as Linter.ESLintParseResult
  }

  // fix adjacent JSX nodes
  // @internal
  // eslint-disable-next-line sonarjs/cognitive-complexity
  private _normalizeJsxNodes(
    node: Node,
    options: ParserOptions,
  ): Node | Node[] {
    const value = node.value

    let program: AST.Program

    try {
      // wrap into single element which is valid jsx but not valid jsx in mdx, so that it won't break on adjacent JSX nodes
      program = this._eslintParse(
        `${JSX_WRAPPER_START}${value}${JSX_WRAPPER_END}`,
        options,
      ).ast
    } catch (err) {
      if (hasProperties<LocationError>(err, LOC_ERROR_PROPERTIES)) {
        const {
          position: { start },
        } = node

        /* istanbul ignore else */
        if ('index' in err) {
          err.index += start.offset - OFFSET
        } else if ('pos' in err) {
          err.pos += start.offset - OFFSET
        }

        err.column =
          /* istanbul ignore next */
          err.lineNumber > 1 ? err.column : err.column + start.column - OFFSET
        err.lineNumber += start.line - 1

        throw err
      }

      return node
    }

    const { expression } = program.body[0] as unknown as ExpressionStatement

    if (!isJsxNode(expression) || expression.children.length <= 1) {
      return node
    }

    const {
      position: {
        start: { line, offset },
      },
      data,
    } = node

    return expression.children.reduce<Node[]>((nodes, jsNode) => {
      if (!isJsxNode(jsNode)) {
        return nodes
      }
      /* istanbul ignore next */
      const {
        start: nodeStart,
        end: nodeEnd,
        loc: { start, end } = {
          start: { column: nodeStart, line: 1 },
          end: { column: nodeEnd, line: 1 },
        },
        range = [nodeStart, nodeEnd],
      } = jsNode
      const startLine = line + start.line - 1
      const endLine = line + end.line - 1
      const startOffset = range[0] - OFFSET
      const endOffset = range[1] - OFFSET
      nodes.push({
        type: 'jsx',
        data: nodes.length > 0 ? null : data,
        value: value.slice(startOffset, endOffset),
        position: {
          start: {
            line: startLine,
            column: line === startLine ? start.column - OFFSET : start.column,
            offset: offset + startOffset,
          },
          end: {
            line: endLine,
            column: line === startLine ? end.column - OFFSET : end.column,
            offset: offset + endOffset,
          },
        },
      })
      return nodes
    }, [])
  }

  // @internal
  private _nodeToAst(code: string, node: Node, options: ParserOptions) {
    if (node.data && node.data.jsxType === 'JSXElementWithHTMLComments') {
      this._services.JSXElementsWithHTMLComments.push(node)
    }

    const value = node.value

    const { loc, start, end } = normalizePosition(node.position)

    // fix #4
    if (isComment(value)) {
      const comment = COMMENT_CONTENT_REGEX.exec(value)[2]
      this._ast.comments.push({
        type: 'Block',
        value: comment,
        loc,
        range: [start, end],
      })
      return
    }

    const startLine = loc.start.line - 1 // ! line is 1-indexed, change to 0-indexed to simplify usage

    let program: AST.Program

    try {
      program = this._eslintParse(value, options).ast
    } catch (e) {
      /* istanbul ignore if */
      if (hasProperties<LocationError>(e, LOC_ERROR_PROPERTIES)) {
        // should be handled by `_normalizeJsxNodes`, just for robustness
        e.index += start
        e.column = e.lineNumber > 1 ? e.column : e.column + loc.start.column
        e.lineNumber += startLine
      }
      throw e
    }

    const startPoint = {
      line: startLine,
      // #279 related
      column: getPositionAt(code, start).column,
      offset: start,
    }

    for (const prop of AST_PROPS)
      this._ast[prop].push(
        // ts doesn't understand the mixed type
        ...program[prop].map((item: never) =>
          restoreNodeLocation(item, startPoint),
        ),
      )
  }
}

export const parser = new Parser()

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { parse, parseForESLint } = parser
