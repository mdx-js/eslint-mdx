import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ESLint } from 'eslint'

import * as mdx from 'eslint-mdx'

const isStylisticSupported = !ESLint.version.startsWith('8.')

const fixturesDir = path.resolve('test/fixtures')

const getCli = async () => {
  const { default: stylistic } = await import('@stylistic/eslint-plugin')
  const recommended = Array.isArray(stylistic.configs.recommended)
    ? stylistic.configs.recommended
    : [stylistic.configs.recommended]

  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      ...recommended,
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser: mdx,
          parserOptions: {
            ecmaFeatures: { jsx: true },
            ecmaVersion: 'latest',
            sourceType: 'module',
          },
        },
      },
    ],
  })
}

it.each(['581.mdx', 'mdx-content-nodes.mdx'])(
  'should pass @stylistic recommended for %s',
  async fixture => {
    if (!isStylisticSupported) {
      return
    }

    const filePath = path.join(fixturesDir, fixture)
    const cli = await getCli()
    const [result] = await cli.lintText(await readFile(filePath, 'utf8'), {
      filePath,
    })
    expect(result.messages).toEqual([])
  },
)
