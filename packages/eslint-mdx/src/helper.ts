/// <reference path="../typings.d.ts" />

import { Linter } from 'eslint'
import { parse as esParse } from 'espree'

import {
  Arrayable,
  CodeBlockNode,
  JsxNode,
  JsxType,
  JsxTypes,
  Node,
  ParserFn,
  ParserOptions,
  ValueOf,
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

  const parsers = [esParse as ParserFn]

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
        parsers.unshift(parserFn)
      }
    } catch {}
  }

  return parsers
}

export interface BaseNode {
  type: string
  loc: import('estree').SourceLocation
  range: [number, number]
  start?: number
  end?: number
}

export const normalizePosition = (
  loc: import('unist').Position,
): Omit<BaseNode, 'type'> => {
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

export const restoreNodeLocation = <T>(
  node: T,
  startLine: number,
  offset: number,
): T => {
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) {
      restoreNodeLocation(value, startLine, offset)
    }
  }

  if (!hasProperties<BaseNode>(node, ['loc', 'range'])) {
    return node
  }

  const {
    loc: { start: startLoc, end: endLoc },
    range,
  } = node
  const start = range[0] + offset
  const end = range[1] + offset

  return Object.assign(node, {
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
  })
}

export const first = <T>(items: T[] | readonly T[]) => items && items[0]

export const last = <T>(items: T[] | readonly T[]) =>
  items && items[items.length - 1]

export const PARSABLE_LANGUAGES = [
  // es
  'cjs',
  'javascript',
  'javascriptreact',
  'js',
  'jsx',
  'mjs',
  // remark
  'markdown',
  'md',
  'mdown',
  'mdx',
  'mkdn',
  // ts
  'ts',
  'tsx',
  'typescript',
  'typescriptreact',
] as const

export const SHORT_PARSABLE_LANGUAGES = [
  // es
  'cjs',
  'js',
  'jsx',
  'mjs',
  // remark
  'md',
  'mdx',
  // ts
  'ts',
  'tsx',
] as const

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type ParsableLanguage = ValueOf<typeof PARSABLE_LANGUAGES>

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type ShortParsableLanguage = ValueOf<typeof SHORT_PARSABLE_LANGUAGES>

export const LANGUAGES_MAPPER: Partial<
  Record<ParsableLanguage, ShortParsableLanguage>
> = {
  javascript: 'js',
  javascriptreact: 'jsx',
  typescript: 'ts',
  typescriptreact: 'tsx',
  markdown: 'md',
  mdown: 'md',
  mkdn: 'md',
}

export const getShortLanguage = (lang: string) => {
  const parsableLanguage = last(
    lang.split(/\s/)[0].split('.'),
  ).toLowerCase() as ParsableLanguage
  return (
    LANGUAGES_MAPPER[parsableLanguage] ||
    (parsableLanguage as ShortParsableLanguage)
  )
}

export const isCodeBlockNode = (node: Node): node is CodeBlockNode =>
  node.type === 'code' &&
  typeof node.lang === 'string' &&
  SHORT_PARSABLE_LANGUAGES.includes(getShortLanguage(node.lang))
