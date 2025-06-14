// @ts-check

import recommended from '@1stg/eslint-config'
import { config } from 'typescript-eslint'

import * as mdx from 'eslint-plugin-mdx'

export default config([
  ...recommended,
  {
    ignores: ['test/fixtures/**'],
  },
  {
    rules: {
      // `strictNullChecks` is required
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'sonarjs/fixme-tag': 'off',
      'sonarjs/todo-tag': 'off',
      'unicorn-x/prefer-export-from': [
        'error',
        {
          ignoreUsedVariables: true,
        },
      ],
      'unicorn-x/template-indent': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allowAsImport: true,
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
      'sonar/max-union-size': 'off',
    },
  },
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
  },
  {
    ...mdx.flatCodeBlocks,
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      ...mdx.flatCodeBlocks.rules,
      'no-magic-numbers': 'off',
      'sonarjs/unused-import': 'off',
    },
  },
])
