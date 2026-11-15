import { defineConfig } from '@1stg/eslint-config'
import * as mdx from 'eslint-plugin-mdx'

export default defineConfig({
  ignores: ['test/fixtures/**'],
  configs: [
    {
      rules: {
        'unicorn/better-dom-traversing': 'off',
        'unicorn/no-break-in-nested-loop': 'off',
        'unicorn/no-top-level-assignment-in-function': 'off',
        'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      },
    },
    {
      ...mdx.flat,
      processor: mdx.createRemarkProcessor({
        lintCodeBlocks: true,
      }),
      rules: {
        ...mdx.flat.rules,
        ...mdx.configs.native.rules,
      },
    },
    {
      ...mdx.flatCodeBlocks,
      languageOptions: {
        parserOptions: { projectService: false },
      },
    },
  ],
})
