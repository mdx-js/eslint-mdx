import { DEFAULT_PARSER_OPTIONS, ParserOptions } from 'eslint-mdx'

import { RuleTester } from 'eslint'

export const parser = require.resolve('eslint-mdx')
export const ruleTester = new RuleTester()
export const parserOptions: ParserOptions = {
  ...DEFAULT_PARSER_OPTIONS,
  comment: true,
  filePath: 'test.mdx',
  tokens: true,
}
