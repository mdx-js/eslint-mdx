import { defineConfig } from '@1stg/eslint-config'

export default defineConfig({
  ignores: ['test/fixtures/**'],
  configs: {
    rules: {
      'unicorn/better-dom-traversing': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
    },
  },
})
