import { RuleTester } from 'eslint'

import type { ParserOptions } from 'eslint-mdx'

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  filePath: '__placeholder__.mdx',
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion: 'latest',
  sourceType: 'module',
  tokens: true,
  comment: true,
  // required for @typescript-eslint/parser
  // reference: https://github.com/typescript-eslint/typescript-eslint/pull/2028
  loc: true,
  range: true,
}

export const parser = require.resolve('eslint-mdx')

export const ruleTester = new RuleTester()
