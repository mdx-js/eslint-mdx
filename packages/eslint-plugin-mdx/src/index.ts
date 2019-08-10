/* istanbul ignore file */

import { parse as oParse, parseForESLint as oParseForESLint } from 'eslint-mdx'

import * as configs from './configs'

import { Linter } from 'eslint'

export { configs }

export * from './rules'

const warn = () =>
  console.error(
    'parse from this plugin is deprecated, please use parser `eslint-mdx` directly',
  )

/**
 * @deprecated
 */
export const parse = (code: string, options?: Linter.ParserOptions) => {
  warn()
  return oParse(code, options)
}

/**
 * @deprecated
 */
export const parseForESLint = (
  code: string,
  options?: Linter.ParserOptions,
) => {
  warn()
  oParseForESLint(code, options)
}
