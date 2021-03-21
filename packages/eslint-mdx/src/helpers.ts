/// <reference path="../typings.d.ts" />

import type { Linter } from 'eslint'
import type { Position as ESPosition, SourceLocation } from 'estree'
import type { Point, Position } from 'unist'

import type {
  Arrayable,
  JsxNode,
  ParserFn,
  ParserOptions,
  ValueOf,
} from './types'

export const FALLBACK_PARSERS = [
  '@typescript-eslint/parser',
  '@babel/eslint-parser',
  'babel-eslint',
  'espree',
] as const

export const JSX_TYPES = ['JSXElement', 'JSXFragment']

export const isJsxNode = (node: { type: string }): node is JsxNode =>
  JSX_TYPES.includes(node.type)

// eslint-disable-next-line sonarjs/cognitive-complexity
export const normalizeParser = (parser?: ParserOptions['parser']) => {
  if (parser) {
    if (typeof parser === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      parser = require(parser) as ParserOptions['parser']
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

  const parsers: ParserFn[] = []

  // try to load FALLBACK_PARSERS automatically
  for (const fallback of FALLBACK_PARSERS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const fallbackParser = require(fallback) as Linter.ParserModule
      /* istanbul ignore next */
      const parserFn =
        'parseForESLint' in fallbackParser
          ? // eslint-disable-next-line @typescript-eslint/unbound-method
            fallbackParser.parseForESLint
          : // eslint-disable-next-line @typescript-eslint/unbound-method
            fallbackParser.parse
      /* istanbul ignore else */
      if (parserFn) {
        parsers.push(parserFn)
      }
    } catch {}
  }

  return parsers
}

export interface BaseNode {
  type: string
  loc: SourceLocation
  range: [number, number]
  start?: number
  end?: number
}

export const normalizePosition = (loc: Position): Omit<BaseNode, 'type'> => {
  const start = loc.start.offset
  const end = loc.end.offset
  return {
    range: [start, end],
    loc,
    start,
    end,
  }
}

export const hasProperties = <T, P extends keyof T = keyof T>(
  obj: unknown,
  properties: Arrayable<P>,
): obj is T =>
  typeof obj === 'object' &&
  obj &&
  properties.every(property => property in obj)

// fix #292
export const getPositionAt = (code: string, offset: number): ESPosition => {
  let currOffset = 0

  const lines = code.split('\n')

  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < lines.length; index++) {
    const line = index + 1
    const nextOffset = currOffset + lines[index].length

    if (nextOffset >= offset) {
      return {
        line,
        column: offset - currOffset,
      }
    }

    currOffset = nextOffset + 1 // add a line break `\n` offset
  }
}

export const restoreNodeLocation = <T>(node: T, point: Point): T => {
  if (node && typeof node === 'object') {
    for (const value of Object.values(node) as Array<ValueOf<T>>) {
      restoreNodeLocation(value, point)
    }
  }

  if (!hasProperties<BaseNode>(node, ['loc', 'range'])) {
    return node
  }

  let {
    loc: { start: startLoc, end: endLoc },
    range: [start, end],
  } = node

  const range = [(start += point.offset), (end += point.offset)] as const

  return Object.assign(node, {
    start,
    end,
    range,
    loc: {
      start: {
        line: point.line + startLoc.line,
        column: startLoc.column + (startLoc.line === 1 ? point.column : 0),
      },
      end: {
        line: point.line + endLoc.line,
        column: endLoc.column + (endLoc.line === 1 ? point.column : 0),
      },
    },
  })
}

export const arrayify = <T, R = T extends Array<infer S> ? S : T>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
    arr.push(...(Array.isArray(curr) ? curr : curr == null ? [] : [curr]))
    return arr
  }, [])

export const first = <T>(items: T[] | readonly T[]) => items && items[0]

export const last = <T>(items: T[] | readonly T[]) =>
  items && items[items.length - 1]
