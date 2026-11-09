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
    'mdx/emphasis-marker': 'warn',
    'mdx/heading-increment': 'warn',
    'mdx/no-heading-punctuation': 'warn',
    'mdx/remark': 'warn',
    'mdx/strong-marker': 'warn',
    'mdx/unordered-list-marker-style': 'warn',
    'no-unused-expressions': 'error',
  },
}
