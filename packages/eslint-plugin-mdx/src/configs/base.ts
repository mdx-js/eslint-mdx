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
    'mdx/no-duplicate-headings': 'warn',
    'mdx/no-duplicate-headings-in-section': 'warn',
    'mdx/no-emphasis-as-heading': 'warn',
    'mdx/no-file-name-articles': 'warn',
    'mdx/no-file-name-consecutive-dashes': 'warn',
    'mdx/no-file-name-irregular-characters': 'warn',
    'mdx/no-file-name-mixed-case': 'warn',
    'mdx/no-file-name-outer-dashes': 'warn',
    'mdx/maximum-heading-length': 'warn',
    'mdx/no-heading-punctuation': 'warn',
    'mdx/no-multiple-toplevel-headings': 'warn',
    'mdx/no-shortcut-reference-image': 'warn',
    'mdx/no-shortcut-reference-link': 'warn',
    'mdx/no-unused-definitions': 'warn',
    'mdx/strong-marker': 'warn',
    'mdx/unordered-list-marker-style': 'warn',
    'mdx/remark': 'warn',
    'no-unused-expressions': 'error',
  },
}
