import type { Linter } from 'eslint'

import { base } from './base'

export const recommended: Linter.Config = {
  ...base,
  rules: {
    'mdx/remark': 1,
    'no-unused-expressions': 2,
  },
}

const overrides: Array<{
  files: string[] | string
  extends?: string[] | string
  rules?: Record<string, number | [number, unknown]>
}> = [
  {
    files: '*.mdx',
    extends: 'plugin:mdx/overrides',
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
