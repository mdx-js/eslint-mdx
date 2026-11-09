import type { Linter } from 'eslint'

import { NATIVE_REMARK_RULES } from '../rules/helpers.js'

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
    'mdx/remark': 'warn',
    'no-unused-expressions': 'error',
  },
  settings: {
    'mdx/native-rules': [...NATIVE_REMARK_RULES],
  },
}
