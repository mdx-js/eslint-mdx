import type { Linter } from 'eslint'
import eslint from 'eslint'
import eslintUnsupportedApi from 'eslint/use-at-your-own-risk'

import type { ParserOptions } from 'eslint-mdx'
import * as eslintMdx from 'eslint-mdx'

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

export const parser = eslintMdx

// istanbul ignore next
const RuleTester =
  'FlatRuleTester' in eslintUnsupportedApi
    ? (eslintUnsupportedApi.FlatRuleTester as typeof eslint.RuleTester)
    : eslint.RuleTester

export const ruleTester = new RuleTester()

export const languageOptions: Linter.LanguageOptions = {
  parser,
  parserOptions: DEFAULT_PARSER_OPTIONS,
}
