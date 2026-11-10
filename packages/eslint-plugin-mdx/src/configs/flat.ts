import type { Linter } from 'eslint'
import * as eslintMdx from 'eslint-mdx'

import * as mdx from '../index.js'
import { remark } from '../processors/remark.js'

import { codeBlocks } from './code-blocks.js'

// eslint-disable-next-line sonarjs/deprecation
export const flat: Linter.FlatConfig = {
  name: 'mdx/flat',
  files: ['**/*.{md,mdx}'],
  languageOptions: {
    parser: eslintMdx,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    globals: {
      React: false,
    },
  },
  plugins: {
    mdx,
  },
  processor: remark,
  rules: {
    'mdx/emphasis-marker': 'warn',
    'mdx/heading-increment': 'warn',
    'mdx/no-duplicate-headings': 'warn',
    'mdx/no-file-name-articles': 'warn',
    'mdx/no-file-name-consecutive-dashes': 'warn',
    'mdx/no-file-name-irregular-characters': 'warn',
    'mdx/no-file-name-mixed-case': 'warn',
    'mdx/no-file-name-outer-dashes': 'warn',
    'mdx/no-heading-punctuation': 'warn',
    'mdx/no-multiple-toplevel-headings': 'warn',
    'mdx/no-shortcut-reference-image': 'warn',
    'mdx/no-unused-definitions': 'warn',
    'mdx/no-shortcut-reference-link': 'warn',
    'mdx/remark': 'warn',
    'mdx/strong-marker': 'warn',
    'mdx/unordered-list-marker-style': 'warn',
    'no-unused-expressions': 'error',
    'react/react-in-jsx-scope': 'off',
  },
}

const { parserOptions, ...restConfig } = codeBlocks

// eslint-disable-next-line sonarjs/deprecation
export const flatCodeBlocks: Linter.FlatConfig = {
  name: 'mdx/flat-code-blocks',
  files: ['**/*.{md,mdx}/**'],
  languageOptions: {
    parserOptions,
  },
  ...restConfig,
}
