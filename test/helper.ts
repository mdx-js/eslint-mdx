import { ParserOptions, Parser } from 'eslint-mdx'

import { Linter } from 'eslint'

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion: new Date().getUTCFullYear() as Linter.ParserOptions['ecmaVersion'],
  sourceType: 'module',
}

export const parser = new Parser(DEFAULT_PARSER_OPTIONS)
