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
    'mdx/no-unused-expressions': 'error',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
  },
}
