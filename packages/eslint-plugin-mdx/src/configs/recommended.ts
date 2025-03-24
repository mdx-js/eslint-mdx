import type { ESLint, Linter } from 'eslint'

import { cjsRequire } from '../helpers.js'

import { base } from './base.js'

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

export const recommended: Linter.LegacyConfig = {
  overrides,
}

const addPrettierRules = () => {
  try {
    cjsRequire.resolve('prettier')

    const { meta } = cjsRequire<ESLint.Plugin>('eslint-plugin-prettier')

    /* istanbul ignore next */
    const version = meta?.version || ''

    /**
     * @see https://github.com/prettier/eslint-plugin-prettier/releases/tag/v5.1.2
     */
    const [major, minor, patch] = version.split('.')

    /* istanbul ignore if -- We can't cover all versions in one test */
    if (
      /* istanbul ignore next */
      +major > 5 ||
      (+major === 5 &&
        (+minor > 1 || (+minor === 1 && Number.parseInt(patch) >= 2)))
    ) {
      return
    }

    /* istanbul ignore next */
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
}

addPrettierRules()
