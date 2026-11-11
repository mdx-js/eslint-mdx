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
    'mdx/final-newline': 'warn',
    'mdx/fenced-code-marker': 'warn',
    'mdx/heading-increment': 'warn',
    'mdx/heading-style': 'warn',
    'mdx/definition-case': 'warn',
    'mdx/definition-spacing': 'warn',
    'mdx/no-consecutive-blank-lines': 'warn',
    'mdx/no-duplicate-definitions': 'warn',
    'mdx/no-duplicate-headings': 'warn',
    'mdx/no-duplicate-headings-in-section': 'warn',
    'mdx/no-emphasis-as-heading': 'warn',
    'mdx/no-file-name-articles': 'warn',
    'mdx/no-file-name-consecutive-dashes': 'warn',
    'mdx/no-file-name-irregular-characters': 'warn',
    'mdx/no-file-name-mixed-case': 'warn',
    'mdx/no-file-name-outer-dashes': 'warn',
    'mdx/maximum-heading-length': 'warn',
    'mdx/no-heading-content-indent': 'warn',
    'mdx/link-title-style': 'warn',
    'mdx/no-heading-punctuation': 'warn',
    'mdx/ordered-list-marker-style': 'warn',
    'mdx/no-literal-urls': 'warn',
    'mdx/no-multiple-toplevel-headings': 'warn',
    'mdx/no-shell-dollars': 'warn',
    'mdx/no-table-indentation': 'warn',
    'mdx/no-shortcut-reference-image': 'warn',
    'mdx/no-shortcut-reference-link': 'warn',
    'mdx/no-unused-definitions': 'warn',
    'mdx/strong-marker': 'warn',
    'mdx/unordered-list-marker-style': 'warn',
    'mdx/rule-style': 'warn',
    'mdx/blockquote-indentation': 'warn',
    'mdx/checkbox-character-style': 'warn',
    'mdx/code-block-style': 'warn',
    'mdx/fenced-code-flag': 'warn',
    'mdx/final-definition': 'warn',
    'mdx/hard-break-spaces': 'warn',
    'mdx/list-item-bullet-indent': 'warn',
    'mdx/list-item-content-indent': 'warn',
    'mdx/list-item-indent': 'warn',
    'mdx/list-item-spacing': 'warn',
    'mdx/maximum-line-length': 'warn',
    'mdx/no-blockquote-without-marker': 'warn',
    'mdx/no-undefined-references': 'warn',
    'mdx/ordered-list-marker-value': 'warn',
    'mdx/table-cell-padding': 'warn',
    'mdx/table-pipe-alignment': 'warn',
    'mdx/table-pipes': 'warn',
    'mdx/file-extension': ['warn', ['mdx', 'md']],
    'mdx/remark': 'warn',
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
