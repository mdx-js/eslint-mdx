import path from 'node:path'

import eslintJs from '@eslint/js'
import { TSESLint } from '@typescript-eslint/utils'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import unicornX from 'eslint-plugin-unicorn-x'
import globals from 'globals'
import { config, configs } from 'typescript-eslint'

import * as mdx from 'eslint-plugin-mdx'

const fixturesDir = path.resolve('test/fixtures')

const getCli = (lintCodeBlocks = false, fix?: boolean) => {
  const remarkConfigPath = path.resolve(
    fixturesDir,
    'custom-remarkrc/my-remarkrc.mjs',
  )
  return new TSESLint.ESLint({
    fix,
    overrideConfigFile: true,
    overrideConfig: config(
      eslintJs.configs.recommended,
      ...configs.recommended,
      // eslint-disable-next-line sonarjs/deprecation -- for ESLint v8 compatibility
      unicornX.configs['flat/recommended'],
      mdx.configs.flat,
      mdx.configs.flatCodeBlocks,
      prettierRecommended,
      {
        files: ['**/*.{js,jsx,md,mdx,ts,tsx}'],
        extends: [react.configs.flat.recommended],
        processor: mdx.createRemarkProcessor({
          lintCodeBlocks,
        }),
        languageOptions: {
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
          globals: globals.node,
        },
        settings: {
          react: {
            version: 'detect',
          },
        },
        rules: {
          camelcase: 'error',
          'no-var': 'error',
          'prefer-const': 'error',
          'react/jsx-curly-brace-presence': 'error',
          'react/self-closing-comp': 'error',
        },
      },
      {
        files: ['**/custom-remarkrc/test.md'],
        processor: mdx.createRemarkProcessor({
          lintCodeBlocks,
          remarkConfigPath,
        }),
        languageOptions: {
          parserOptions: {
            remarkConfigPath,
          },
        },
      },
    ),
  })
}

const ONE_MINUTE = 60_000

const relative = (filePath: string) =>
  path.relative(fixturesDir, filePath).replaceAll('\\', '/')

describe('fixtures', () => {
  it(
    'should match all snapshots',
    async () => {
      const patterns = ['test/fixtures/*', 'test/fixtures/**/*{md,mdx}']
      let results = await getCli().lintFiles(patterns)
      for (const { filePath, messages } of results) {
        expect(messages).toMatchSnapshot(relative(filePath))
      }
      results = await getCli(false, true).lintFiles(patterns)
      for (const { filePath, source, output } of results) {
        if (output != null && source !== output) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(output).toMatchSnapshot(relative(filePath))
        }
      }
    },
    ONE_MINUTE,
  )

  describe('lint code blocks', () => {
    it(
      'should work as expected',
      async () => {
        const patterns = 'test/fixtures/code-blocks/*.{md,mdx}'
        let results = await getCli(true).lintFiles(patterns)
        for (const { filePath, messages } of results) {
          expect(messages).toMatchSnapshot(relative(filePath))
        }
        results = await getCli(true, true).lintFiles(patterns)
        for (const { filePath, source, output } of results) {
          if (output != null && source !== output) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(output).toMatchSnapshot(relative(filePath))
          }
        }
      },
      ONE_MINUTE,
    )
  })
})
