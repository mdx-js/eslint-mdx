import type { Linter } from 'eslint'

import { base } from './base'

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

export const recommended: Linter.Config = {
  overrides,
}

try {
  require.resolve('prettier')
  require.resolve('eslint-plugin-prettier')
  overrides.push(
    {
      files: '*.md',
      rules: {
        'prettier/prettier': [
          'error',
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
          'error',
          {
            parser: 'mdx',
          },
        ],
      },
    },
  )
} catch {}
