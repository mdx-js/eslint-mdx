/// <reference path="../typings.d.ts" />

import { AST, Linter } from 'eslint'
import { parse as esParse } from 'espree'

import {
  Arrayable,
  JsxNode,
  JsxType,
  JsxTypes,
  ParserFn,
  ParserOptions,
} from './types'

export const FALLBACK_PARSERS = [
  '@typescript-eslint/parser',
  '@babel/eslint-parser',
  'babel-eslint',
] as const

export const JSX_TYPES: JsxTypes = ['JSXElement', 'JSXFragment']

export const isJsxNode = (node: { type: string }): node is JsxNode =>
  JSX_TYPES.includes(node.type as JsxType)

// eslint-disable-next-line sonarjs/cognitive-complexity
export const normalizeParser = (parser?: ParserOptions['parser']) => {
  if (parser) {
    if (typeof parser === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      parser = require(parser)
    }

    if (typeof parser === 'object') {
      parser =
        ('parseForESLint' in parser && parser.parseForESLint) ||
        ('parse' in parser && parser.parse)
    }

    if (typeof parser !== 'function') {
      throw new TypeError(`Invalid custom parser for \`eslint-mdx\`: ${parser}`)
    }

    return [parser]
  }

  const parsers = [esParse as ParserFn]

  // try to load FALLBACK_PARSERS automatically
  for (const fallback of FALLBACK_PARSERS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const fallbackParser: Linter.ParserModule = require(fallback)
      /* istanbul ignore next */
      const parserFn =
        'parseForESLint' in fallbackParser
          ? fallbackParser.parseForESLint
          : fallbackParser.parse
      /* istanbul ignore else */
      if (parserFn) {
        parsers.unshift(parserFn)
      }
    } catch {}
  }

  return parsers
}

export const normalizePosition = (
  position: import('unist').Position,
): Pick<AST.Program, 'loc' | 'range'> & {
  start: number
  end: number
} => {
  const start = position.start.offset
  const end = position.end.offset
  return {
    range: [start, end],
    loc: {
      ...position,
    },
    start,
    end,
  }
}

export interface BaseNode {
  type: string
  loc?: import('estree').SourceLocation
  range?: [number, number]
}

export const maybeBaseNode = (node: unknown): node is BaseNode =>
  typeof node === 'object' && 'loc' in node && 'range' in node

export function restoreNodeLocation<T>(
  node: T,
  startLine: number,
  offset: number,
): T {
  if (!maybeBaseNode(node)) {
    return node
  }

  for (const entry of Object.entries(node)) {
    const [key, value] = entry as [keyof BaseNode, BaseNode[keyof BaseNode]]

    if (!value) {
      continue
    }

    // ts doesn't understand the relationship between `key` and restored `value`
    // @ts-ignore
    node[key] = Array.isArray(value)
      ? value.map(child => restoreNodeLocation(child, startLine, offset))
      : restoreNodeLocation(value, startLine, offset)
  }

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

export const first = <T>(items: T[] | readonly T[]) => items && items[0]

export const last = <T>(items: T[] | readonly T[]) =>
  items && items[items.length - 1]

export const hasProperties = <T, P extends keyof T = keyof T>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: {},
  properties: Arrayable<P>,
): obj is T => properties.every(property => property in obj)
