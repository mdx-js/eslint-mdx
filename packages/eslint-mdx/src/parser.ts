// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../typings.d.ts" />

import path from 'path'

import { parse as esParse } from 'espree'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import unified from 'unified'

import {
  normalizeJsxNode,
  normalizePosition,
  restoreNodeLocation,
  hasProperties,
} from './helper'
import { isComment } from './regexp'
import { traverse } from './traverse'
import { ParserOptions, LocationError } from './types'

import { AST, Linter } from 'eslint'
import { Parent, Node } from 'unist'

export const mdxProcessor = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .freeze()

export const AST_PROPS = ['body', 'comments', 'tokens'] as const
export const ES_NODE_TYPES = ['export', 'import', 'jsx'] as const

export type EsNodeType = (typeof ES_NODE_TYPES)[number]

export const LOC_ERROR_PROPERTIES = ['column', 'index', 'lineNumber'] as const

export const DEFAULT_EXTENSIONS = ['.mdx']

export const FALLBACK_PARSERS = ['@typescript-eslint/parser', 'babel-eslint']

export const parseForESLint = (code: string, options: ParserOptions = {}) => {
  let { extensions, parser } = options

  if (parser) {
    if (typeof parser === 'string') {
      parser = require(parser)
    }

    if (typeof parser === 'object') {
      parser = parser.parseForESLint || parser.parse
    }

    if (typeof parser !== 'function') {
      throw new TypeError(
        `Invalid custom parser for \`eslint-plugin-mdx\`: ${options.parser}`,
      )
    }
  } else {
    // try to load FALLBACK_PARSERS automatically
    for (const fallback of FALLBACK_PARSERS) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fallbackParser = require(fallback)
        parser = fallbackParser.parseForESLint || fallbackParser.parse
        break
      } catch (e) {}
    }

    if (typeof parser !== 'function') {
      parser = esParse
    }
  }

  if (
    !DEFAULT_EXTENSIONS.concat(extensions || []).includes(
      path.extname(options.filePath),
    )
  ) {
    const program = parser(code, options)
    return (program.ast
      ? program
      : { ast: program }) as Linter.ESLintParseResult
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
  const services = {
    JSXElementsWithHTMLComments: [] as Node[],
  }

  traverse(root, {
    enter(node, parent) {
      if (!ES_NODE_TYPES.includes(node.type as EsNodeType)) {
        return
      }

      normalizeJsxNode(node, parent)

      if (node.data && node.data.jsxType === 'JSXElementWithHTMLComments') {
        services.JSXElementsWithHTMLComments.push(node)
      }

      const value = node.value as string

      // fix #4
      if (isComment(value)) {
        return
      }

      const { loc, start } = normalizePosition(node.position)
      const startLine = loc.start.line - 1 //! line is 1-indexed, change to 0-indexed to simplify usage

      let program: AST.Program | Linter.ESLintParseResult

      try {
        program = parser(value, options)
      } catch (e) {
        if (hasProperties<LocationError>(e, LOC_ERROR_PROPERTIES)) {
          e.index += start
          e.column += loc.start.column
          e.lineNumber += startLine
        }

        throw e
      }

      if ('ast' in program) {
        program = program.ast
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
    services,
  } as Linter.ESLintParseResult
}

export const parse = (code: string, options: Linter.ParserOptions = {}) =>
  parseForESLint(code, options).ast
