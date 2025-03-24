import type { Linter } from 'eslint'
import * as eslintMdx from 'eslint-mdx'

import * as mdx from '../index.js'

import { codeBlocks } from './code-blocks.js'

// eslint-disable-next-line sonarjs/deprecation
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
    'react/react-in-jsx-scope': 'off',
  },
}

const { parserOptions, ...restConfig } = codeBlocks

// eslint-disable-next-line sonarjs/deprecation
export const flatCodeBlocks: Linter.FlatConfig = {
  files: ['**/*.{md,mdx}/**'],
  languageOptions: {
    parserOptions,
  },
  ...restConfig,
}
