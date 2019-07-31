// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../types.d.ts" />

import { parse as esParse } from 'espree'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified from 'unified'

import { traverse } from './traverse'
import { isComment } from './utils'

import { Position, Parent } from 'unist'
import { AST, Linter } from 'eslint'
import {
  Comment,
  ModuleDeclaration,
  Statement,
  // SourceLocation` is not exported from estree, but it is actually working
  // eslint-disable-next-line import/named
  SourceLocation,
} from 'estree'

const normalizePosition = (position: Position) => {
  const start = position.start.offset
  const end = position.end.offset
  return {
    range: [start, end] as AST.Range,
    loc: {
      ...position,
    },
    start,
    end,
  }
}

interface BaseNode {
  type: string
  loc?: SourceLocation
  range?: [number, number]
}

function normalizeLoc<T extends BaseNode>(
  node: T,
  startLine: number,
  offset = 0,
): T {
  if (!node || !node.loc || !node.range) {
    return node
  }

  Object.entries(node).forEach(([key, value]) => {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      node[key as keyof T] = value.map(child =>
        normalizeLoc(child, startLine, offset),
      ) as any
    } else {
      node[key as keyof T] = normalizeLoc(
        value,
        startLine,
        offset,
      ) as T[keyof T]
    }
  })

  const {
    loc: { start: startLoc, end: endLoc },
    range,
  } = node
  const start = range[0] + offset
  const end = range[1] + offset
  return {
    ...node,
    start,
    end,
    range: [start, end],
    loc: {
      start: {
        line: startLine + startLoc.line,
        column: startLoc.column,
      },
      end: {
        line: startLine + endLoc.line,
        column: endLoc.column,
      },
    },
  }
}

export const parseForESLint = (
  code: string,
  options: Linter.ParserOptions,
): Linter.ESLintParseResult => {
  let { parser } = options

  if (parser) {
    if (typeof parser === 'string') {
      parser = require(parser).parse
    } else {
      if (typeof parser === 'object') {
        parser = parser.parseForESLint || parser.parse
      }
      if (typeof parser !== 'function') {
        throw new Error(
          `Invalid custom parser for \`eslint-plugin-mdx\`: ${parser}`,
        )
      }
    }
  } else {
    parser = esParse
  }

  const root = unified()
    .use<any>(remarkParse)
    .use<any>(remarkStringify)
    .use(remarkMdx)
    .parse(code) as Parent

  const body: Array<Statement | ModuleDeclaration> = []
  const comments: Comment[] = []
  const tokens: AST.Token[] = []

  traverse(root, {
    enter({ position, type }) {
      if (!['export', 'import', 'jsx'].includes(type)) {
        return
      }

      const rawText = code.slice(position.start.offset, position.end.offset)

      // fix #4
      if (isComment(rawText)) {
        return
      }

      const node = normalizePosition(position)

      let program: AST.Program

      try {
        program = parser(rawText, options)
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.index += node.start
          e.column += node.loc.start.column
          e.lineNumber += node.loc.start.line - 1 // lineNumber in 0-indexed, but line is 1-indexed
        }

        throw e
      }

      const {
        body: esBody,
        comments: esComments,
        tokens: esTokens,
        range,
      } = program

      const startLine = node.loc.start.line - 1 //! line is 1-indexed, change to 0-indexed to simplify usage
      const offset = node.start - range[0]

      body.push(...esBody.map(item => normalizeLoc(item, startLine, offset)))
      comments.push(
        ...esComments.map(comment => normalizeLoc(comment, startLine, offset)),
      )
      tokens.push(
        ...esTokens.map(token => normalizeLoc(token, startLine, offset)),
      )
    },
  })

  return {
    ast: {
      ...normalizePosition(root.position),
      type: 'Program',
      sourceType: 'module',
      body,
      comments,
      tokens,
    },
  }
}
