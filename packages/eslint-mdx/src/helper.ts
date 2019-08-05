// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../typings.d.ts" />

import { parse as esParse } from 'espree'

import {
  Arrayable,
  JsxNode,
  JsxType,
  JsxTypes,
  ParserOptions,
  ParserFn,
} from './types'

import { Position } from 'unist'
import { AST } from 'eslint'
// `SourceLocation` is not exported from estree, but it is actually working
// eslint-disable-next-line import/named
import { SourceLocation } from 'estree'

export const FALLBACK_PARSERS = [
  '@typescript-eslint/parser',
  'babel-eslint',
] as const

export const JSX_TYPES: JsxTypes = ['JSXElement', 'JSXFragment']

export const isJsxNode = (node: { type: string }): node is JsxNode =>
  JSX_TYPES.includes(node.type as JsxType)

export const normalizeParser = (parser: ParserOptions['parser']) => {
  if (parser) {
    if (typeof parser === 'string') {
      parser = require(parser)
    }

    if (typeof parser === 'object') {
      parser = parser.parseForESLint || parser.parse
    }

    if (typeof parser !== 'function') {
      throw new TypeError(
        `Invalid custom parser for \`eslint-plugin-mdx\`: ${parser}`,
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
      parser = esParse as ParserFn
    }

    return parser
  }
}

export const normalizePosition = (position: Position) => {
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

export interface BaseNode {
  type: string
  loc?: SourceLocation
  range?: [number, number]
}

export function restoreNodeLocation<T extends BaseNode>(
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
        restoreNodeLocation(child, startLine, offset),
      ) as any
    } else {
      node[key as keyof T] = restoreNodeLocation(
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

export const first = <T>(items: T[] | ReadonlyArray<T>) => items && items[0]

export const last = <T>(items: T[] | ReadonlyArray<T>) =>
  items && items[items.length - 1]

export const hasProperties = <T, P extends keyof T = keyof T>(
  obj: {},
  properties: Arrayable<P>,
): obj is T => properties.every(property => property in obj)
