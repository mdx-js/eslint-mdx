import type { Linter } from 'eslint'

export const base: Linter.LegacyConfig = {
  parser: 'eslint-mdx',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['mdx'],
  processor: 'mdx/remark',
  rules: {
    'mdx/remark': 'warn',
    'no-unused-expressions': 'error',
  },
}
