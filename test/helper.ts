import { DEFAULT_PARSER_OPTIONS, ParserOptions } from 'eslint-mdx'

import { RuleTester } from 'eslint'

export function noop<T extends unknown[] = unknown[], R = unknown>(
  ..._args: T
): R {
  return undefined
}

export const parser = require.resolve('eslint-mdx')

export const ruleTester = new RuleTester()

export const parserOptions: ParserOptions = {
  ...DEFAULT_PARSER_OPTIONS,
  filePath: 'test.mdx',
}
