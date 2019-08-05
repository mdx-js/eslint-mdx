import path from 'path'

import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import unified from 'unified'

import {
  hasProperties,
  isJsxNode,
  normalizeParser,
  normalizePosition,
  restoreNodeLocation,
  last,
} from './helper'
import { isComment, COMMENT_CONTENT_REGEX } from './regexp'
import { traverse } from './traverse'
import { ParserOptions, LocationError, Comment } from './types'

import { AST, Linter } from 'eslint'
import { Parent, Node } from 'unist'
import { ExpressionStatement } from 'estree'

export const mdxProcessor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .freeze()

export const AST_PROPS = ['body', 'comments', 'tokens'] as const
export const ES_NODE_TYPES: readonly string[] = ['export', 'import', 'jsx']

export const LOC_ERROR_PROPERTIES = ['column', 'index', 'lineNumber'] as const

export const DEFAULT_EXTENSIONS: readonly string[] = ['.mdx']

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  ecmaFeatures: { jsx: true },
  ecmaVersion: new Date().getUTCFullYear() as Linter.ParserOptions['ecmaVersion'],
  sourceType: 'module',
}

export class Parser {
  // @internal
  private parser = normalizeParser(this.options.parser)

  // @internal
  private ast: AST.Program

  // @internal
  private services = {
    JSXElementsWithHTMLComments: [] as Node[],
  }

  constructor(
    // @internal
    private code = '',
    // @internal
    private options: ParserOptions = DEFAULT_PARSER_OPTIONS,
  ) {
    this.parse = this.parse.bind(this)
    this.parseForESLint = this.parseForESLint.bind(this)
    this.nodeToAst = this.nodeToAst.bind(this)
  }

  normalizeJsxNode(node: Node, parent?: Parent) {
    const value = node.value as string

    if (node.type !== 'jsx' || isComment(value)) {
      return node
    }

    const matched = value.match(COMMENT_CONTENT_REGEX)

    if (matched) {
      const comments: Comment[] = []
      const {
        position: {
          start: { line, column, offset: startOffset },
        },
      } = node

      Object.assign(node, {
        data: {
          ...node.data,
          jsxType: 'JSXElementWithHTMLComments',
          comments,
          // jsx in paragraph is considered as plain html in mdx, what means html style comments are valid
          // TODO: in this case, jsx style comments could be a mistake
          inline: !!parent && parent.type !== 'root',
        },
        value: value.replace(
          COMMENT_CONTENT_REGEX,
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
              loc: {
                start: {
                  line: line + startLineOffset,
                  column:
                    last(startLines).length +
                    (startLineOffset ? 0 : column - 1),
                  offset: startOffset + offset,
                },
                end: {
                  line: line + endLineOffset - 1,
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

    return this.normalizeJsxNodes(node)
  }

  parse(code = this.code, options = this.options) {
    return this.parseForESLint(code, options).ast
  }

  parseForESLint(code = this.code, options = this.options) {
    if (
      !DEFAULT_EXTENSIONS.concat(this.options.extensions || []).includes(
        path.extname(options.filePath),
      )
    ) {
      return this.eslintParse(code, options)
    }

    const root = mdxProcessor.parse(this.code) as Parent

    this.ast = {
      ...normalizePosition(root.position),
      type: 'Program',
      sourceType: this.options.sourceType || 'module',
      body: [],
      comments: [],
      tokens: [],
    }

    traverse(root, {
      enter: (node, parent) => {
        if (!ES_NODE_TYPES.includes(node.type)) {
          return
        }

        let normalized = this.normalizeJsxNode(node, parent)
        normalized = Array.isArray(normalized) ? normalized : [normalized]
        normalized.forEach(this.nodeToAst)
      },
    })

    return {
      ast: this.ast,
      services: this.services,
    } as Linter.ESLintParseResult
  }

  // @internal
  private eslintParse(code = this.code, options = this.options) {
    const program = this.parser(code, options)
    return ('ast' in program && program.ast
      ? program
      : { ast: program }) as Linter.ESLintParseResult
  }

  // fix adjacent JSX nodes
  // @internal
  private normalizeJsxNodes(node: Node): Node | Node[] {
    const value = node.value as string

    // wrap into single Fragment, so that it won't break on adjacent JSX nodes
    const program = this.eslintParse(`<>${value}</>`).ast

    const { expression } = program.body[0] as ExpressionStatement

    if (!isJsxNode(expression) || expression.children.length <= 1) {
      return node
    }

    const {
      position: {
        start: { line, offset },
      },
    } = node

    return expression.children.reduce<Node[]>((nodes, jsNode) => {
      if (!isJsxNode(jsNode)) {
        return nodes
      }
      const {
        loc: { start, end },
        range,
      } = jsNode
      const startLine = line + start.line - 1
      const endLine = line + end.line - 1
      const startOffset = range[0] - 2
      const endOffset = range[1] - 2
      nodes.push({
        type: 'jsx',
        data: nodes.length ? null : node.data,
        value: value.slice(startOffset, endOffset),
        position: {
          start: {
            line: startLine,
            column: line === startLine ? start.column - 2 : start.column,
            offset: offset + startOffset,
          },
          end: {
            line: endLine,
            column: line === startLine ? end.column - 2 : end.column,
            offset: offset + endOffset,
          },
        },
      })
      return nodes
    }, [])
  }

  // @internal
  private nodeToAst(node: Node) {
    if (node.data && node.data.jsxType === 'JSXElementWithHTMLComments') {
      this.services.JSXElementsWithHTMLComments.push(node)
    }

    const value = node.value as string

    // fix #4
    if (isComment(value)) {
      return
    }

    const { loc, start } = normalizePosition(node.position)
    const startLine = loc.start.line - 1 //! line is 1-indexed, change to 0-indexed to simplify usage

    let program: AST.Program

    try {
      program = this.eslintParse(value).ast
    } catch (e) {
      if (hasProperties<LocationError>(e, LOC_ERROR_PROPERTIES)) {
        e.index += start
        e.column += loc.start.column
        e.lineNumber += startLine
      }

      throw e
    }

    const offset = start - program.range[0]

    AST_PROPS.forEach(prop =>
      this.ast[prop].push(
        // unfortunately, TS complains about incompatible signature
        // @ts-ignore
        ...program[prop].map(item =>
          restoreNodeLocation(item, startLine, offset),
        ),
      ),
    )
  }
}

export const parser = new Parser()

export const { parse, parseForESLint } = parser
