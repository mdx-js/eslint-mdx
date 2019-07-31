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
// SourceLocation` is not exported from estree, but it is actually working
// eslint-disable-next-line import/named
import { SourceLocation } from 'estree'

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

export const AST_PROPS = ['body', 'comments', 'tokens'] as const

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

  const ast: AST.Program = {
    ...normalizePosition(root.position),
    type: 'Program',
    sourceType: options.sourceType || 'module',
    body: [],
    comments: [],
    tokens: [],
  }

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
      const startLine = node.loc.start.line - 1 //! line is 1-indexed, change to 0-indexed to simplify usage

      let program: AST.Program

      try {
        program = parser(rawText, options)
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.index += node.start
          e.column += node.loc.start.column
          e.lineNumber += startLine
        }

        throw e
      }

      const offset = node.start - program.range[0]

      AST_PROPS.forEach(prop =>
        ast[prop].push(
          // unfortunately, TS complains about incompatible signature
          // @ts-ignore
          ...program[prop].map(item => normalizeLoc(item, startLine, offset)),
        ),
      )
    },
  })

  return {
    ast,
  }
}
