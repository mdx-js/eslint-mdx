import path from 'node:path'

import eslintJs from '@eslint/js'
import eslint from 'eslint'
import eslintUnsupportedApi from 'eslint/use-at-your-own-risk'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintReact from 'eslint-plugin-react'
import eslintUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'

import * as mdx from 'eslint-plugin-mdx'

// eslint-disable-next-line sonarjs/deprecation
const ESLint = eslintUnsupportedApi.FlatESLint ?? eslint.ESLint

const getCli = (lintCodeBlocks = false, fix?: boolean) =>
  new ESLint({
    fix,
    overrideConfigFile: true,
    baseConfig: [
      {
        files: ['**/*.{js,jsx,mdx,tsx}'],
        ...eslintReact.configs.flat.recommended,
        rules: {
          ...eslintReact.configs.flat.recommended.rules,
          'react/jsx-curly-brace-presence': 'error',
          'react/jsx-sort-props': 'error',
          'react/self-closing-comp': 'error',
        },
      },
      eslintJs.configs.recommended,
      // eslint-disable-next-line sonarjs/deprecation
      eslintUnicorn.configs['flat/recommended'],
      mdx.configs.flat,
      mdx.configs.flatCodeBlocks,
      prettierRecommended,
      {
        processor: mdx.createRemarkProcessor({
          lintCodeBlocks,
        }),
        languageOptions: {
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
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
          'no-var': 'error',
          'prefer-const': 'error',
        },
      },
    ],
  })

const ONE_MINUTE = 60_000

describe('fixtures', () => {
  it(
    'should match all snapshots',
    async () => {
      const patterns = ['test/fixtures/*', 'test/fixtures/**/*{md,mdx}']
      let results = await getCli().lintFiles(patterns)
      for (const { filePath, messages } of results) {
        expect(messages).toMatchSnapshot(path.basename(filePath))
      }
      results = await getCli(false, true).lintFiles(patterns)
      for (const { filePath, source, output } of results) {
        if (output != null && source !== output) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(output).toMatchSnapshot(path.basename(filePath))
        }
      }
    },
    ONE_MINUTE,
  )

  describe('lint code blocks', () => {
    it(
      'should work as expected',
      async () => {
        const patterns = 'test/fixtures/**/code-blocks.{md,mdx}'
        let results = await getCli(true).lintFiles(patterns)
        for (const { filePath, messages } of results) {
          expect(messages).toMatchSnapshot(path.basename(filePath))
        }
        results = await getCli(true, true).lintFiles(patterns)
        for (const { filePath, source, output } of results) {
          if (output != null && source !== output) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(output).toMatchSnapshot(path.basename(filePath))
          }
        }
      },
      ONE_MINUTE,
    )
  })
})
