import type { Linter } from 'eslint'

import { base } from './base'

export const recommended: Linter.Config = {}

const overrides: Linter.ConfigOverride[] = [
  {
    files: ['*.md', '*.mdx'],
    extends: 'plugin:mdx/overrides',
    ...base,
  },
  {
    files: '**/*.{md,mdx}/**',
    extends: 'plugin:mdx/code-blocks',
  },
]

try {
  require.resolve('prettier')
  require.resolve('eslint-plugin-prettier')
  overrides.push(
    {
      files: '*.md',
      rules: {
        'prettier/prettier': [
          2,
          {
            parser: 'markdown',
          },
        ],
      },
    },
    {
      files: '*.mdx',
      rules: {
        'prettier/prettier': [
          2,
          {
            parser: 'mdx',
          },
        ],
      },
    },
  )
} catch {}

Object.assign(recommended, {
  overrides,
})
