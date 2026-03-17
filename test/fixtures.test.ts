import path from 'node:path'

import eslintJs from '@eslint/js'
import { TSESLint } from '@typescript-eslint/utils'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import react from 'eslint-plugin-react'
import globals from 'globals'
// eslint-disable-next-line sonarjs/deprecation
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
    // eslint-disable-next-line sonarjs/deprecation
    overrideConfig: config(
      eslintJs.configs.recommended,
      ...configs.recommended,
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
          globals: globals.node,
        },
        settings: {
          react: {
            version: 'detect',
          },
        },
        rules: {
          camelcase: 'error',
          // incompatible with eslint v8
          'no-unassigned-vars': 'off',
          'no-useless-assignment': 'off',
          'preserve-caught-error': 'off',

          'no-var': 'error',
          'prefer-const': 'error',
          'react/jsx-curly-brace-presence': 'error',
          'react/self-closing-comp': 'error',
          'no-unused-vars': 'error',
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

const cleanupMessages = (messages: TSESLint.ESLint.LintMessage[]) => {
  const msgs: TSESLint.ESLint.LintMessage[] = []
  for (const msg of messages) {
    // added on ESLint v10
    if (msg.ruleId === 'no-undef') {
      continue
    }
    // removed on ESLint v10
    if ('nodeType' in msg) {
      delete msg.nodeType
    }
    msgs.push(msg)
  }
  return msgs
}

describe('fixtures', () => {
  it(
    'should match all snapshots',
    async () => {
      const patterns = ['test/fixtures/*', 'test/fixtures/**/*{md,mdx}']
      let results = await getCli().lintFiles(patterns)
      for (const { filePath, messages } of results) {
        expect(cleanupMessages(messages)).toMatchSnapshot(relative(filePath))
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

  it(
    'should not report no-unused-vars for JSX component imports in MDX',
    async () => {
      const cli = getCli()

      const results = await cli.lintFiles(
        path.join(fixturesDir, 'jsx-imports.mdx'),
      )

      const messages = results.flatMap(r => r.messages)
      const unusedVarsMessages = messages.filter(
        m => m.ruleId === 'no-unused-vars',
      )

      expect(unusedVarsMessages).toEqual([])
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
          expect(cleanupMessages(messages)).toMatchSnapshot(relative(filePath))
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
