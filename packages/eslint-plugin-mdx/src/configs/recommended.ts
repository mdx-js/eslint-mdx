import { createRequire } from 'node:module'
import path from 'node:path'

import type { ESLint, Linter } from 'eslint'

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

/* istanbul ignore next */
// hack to bypass syntax error for commonjs
const getImportMetaUrl = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return new Function('return import.meta.url')() as string
  } catch {
    // if `--experimental-vm-modules` is not enabled, the following error would be thrown:
    // `SyntaxError: Cannot use 'import.meta' outside a module`,
    // then we fallback to `process.cwd()` resolution which could fail actually,
    // but we're only trying to resolve `prettier` and `eslint-plugin-prettier` dependencies,
    // it would be fine enough
    return path.resolve(process.cwd(), '__test__.js')
  }
}

/* istanbul ignore next */
const cjsRequire =
  typeof require === 'undefined' ? createRequire(getImportMetaUrl()) : require

const addPrettierRules = () => {
  try {
    cjsRequire.resolve('prettier')

    const { meta } = cjsRequire('eslint-plugin-prettier') as ESLint.Plugin

    /* istanbul ignore next */
    const version = meta?.version || ''

    /**
     * @see https://github.com/prettier/eslint-plugin-prettier/releases/tag/v5.1.2
     */
    const [major, minor, patch] = version.split('.')

    /* istanbul ignore if -- We're using `eslint-plugin-prettier@4.2.1` for now */
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
