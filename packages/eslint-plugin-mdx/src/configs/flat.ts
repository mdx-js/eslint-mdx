import type { Linter } from 'eslint'
import * as eslintMdx from 'eslint-mdx'

import * as mdx from '..'

import { codeBlocks } from './code-blocks'

export const flat: Linter.FlatConfig = {
  files: ['**/*.{md,mdx}'],
  languageOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
    parser: eslintMdx,
    globals: {
      React: false,
    },
  },
  plugins: {
    mdx,
  },
  rules: {
    'mdx/remark': 'warn',
    'no-unused-expressions': 'error',
    'react/react-in-jsx-scope': 0,
  },
}

const { parserOptions, ...restConfig } = codeBlocks

export const flatCodeBlocks: Linter.FlatConfig = {
  files: ['**/*.{md,mdx}/*'],
  languageOptions: {
    parserOptions,
  },
  ...restConfig,
}
