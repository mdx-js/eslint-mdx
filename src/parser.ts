// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../types.d.ts" />

import { parse as esParse } from 'espree'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified from 'unified'

import { normalizePosition, restoreNodeLocation } from './helper'
import { isComment } from './regexp'
import { traverse } from './traverse'

import { AST, Linter } from 'eslint'
import { Parent } from 'unist'

export const AST_PROPS = ['body', 'comments', 'tokens'] as const
export const ES_NODE_TYPES = ['export', 'import', 'jsx'] as const

export type EsNodeType = (typeof ES_NODE_TYPES)[number]

export const mdxProcessor = unified()
  .use<any>(remarkParse)
  .use<any>(remarkStringify)
  .use(remarkMdx)
  .freeze()

export const parseForESLint = (
  code: string,
  options: Linter.ParserOptions = {},
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
        throw new TypeError(
          `Invalid custom parser for \`eslint-plugin-mdx\`: ${parser}`,
        )
      }
    }
  } else {
    try {
      // try to load babel-eslint automatically
      parser = require(require.resolve('babel-eslint')).parse
    } catch (e) {
      parser = esParse
    }
  }

  const root = mdxProcessor.parse(code) as Parent

  const ast: AST.Program = {
    ...normalizePosition(root.position),
    type: 'Program',
    sourceType: options.sourceType || 'module',
    body: [],
    comments: [],
    tokens: [],
  }

  traverse(root, {
    enter(node) {
      if (!ES_NODE_TYPES.includes(node.type as EsNodeType)) {
        return
      }

      const rawText = node.value as string

      // fix #4
      if (isComment(rawText)) {
        return
      }

      const { loc, start } = normalizePosition(node.position)
      const startLine = loc.start.line - 1 //! line is 1-indexed, change to 0-indexed to simplify usage

      let program: AST.Program

      try {
        program = parser(rawText, options)
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.index += start
          e.column += loc.start.column
          e.lineNumber += startLine
        }

        throw e
      }

      const offset = start - program.range[0]

      AST_PROPS.forEach(prop =>
        ast[prop].push(
          // unfortunately, TS complains about incompatible signature
          // @ts-ignore
          ...program[prop].map(item =>
            restoreNodeLocation(item, startLine, offset),
          ),
        ),
      )
    },
  })

  return {
    ast,
  }
}
