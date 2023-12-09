import path from 'node:path'

import { ESLint } from 'eslint'

const getCli = (lintCodeBlocks = false) =>
  new ESLint({
    ignore: false,
    useEslintrc: false,
    baseConfig: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      env: {
        node: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:unicorn/recommended',
        'plugin:prettier/recommended',
        'plugin:mdx/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/jsx-curly-brace-presence': 'error',
        'react/self-closing-comp': 'error',
      },
      overrides: lintCodeBlocks
        ? [
            {
              files: '**/*.{md,mdx}/**',
              rules: {
                'no-var': 'error',
                'prefer-const': 'error',
                'prettier/prettier': 'off',
              },
            },
            {
              files: '*.{md,mdx}',
              settings: {
                'mdx/code-blocks': true,
              },
            },
          ]
        : [],
    },
    reportUnusedDisableDirectives: 'error',
  })

describe('fixtures', () => {
  it('should match all snapshots', async () => {
    const results = await getCli().lintFiles([
      'test/fixtures/*',
      'test/fixtures/**/*{md,mdx}',
    ])
    for (const { filePath, messages } of results) {
      expect(messages).toMatchSnapshot(path.basename(filePath))
    }
  })

  describe('lint code blocks', () => {
    it('should work as expected', async () => {
      const results = await getCli(true).lintFiles(
        'test/fixtures/**/code-blocks.{md,mdx}',
      )
      for (const { filePath, messages } of results) {
        expect(messages).toMatchSnapshot(path.basename(filePath))
      }
    })
  })
})
