import type { Linter } from 'eslint'

export const base: Linter.Config = {
  parser: 'eslint-mdx',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['mdx'],
  processor: 'mdx/remark',
  rules: {
    'mdx/remark': 1,
    'no-unused-expressions': 2,
  },
}
