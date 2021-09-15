import path from 'path'

import { ESLint } from 'eslint'

const getCli = (lintCodeBlocks = false) =>
  new ESLint({
    ignore: false,
    fix: true,
    useEslintrc: false,
    baseConfig: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      extends: ['plugin:mdx/recommended'],
      plugins: ['react', 'unicorn', 'prettier'],
      rules: {
        'react/no-unescaped-entities': 1,
        'unicorn/prefer-spread': 2,
      },
      overrides: lintCodeBlocks
        ? [
            {
              files: '**/*.{md,mdx}/**',
              rules: {
                'prettier/prettier': 0,
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
    const results = await getCli().lintFiles('test/fixtures/*.{md,mdx}')
    for (const { filePath, messages } of results) {
      expect(messages).toMatchSnapshot(path.basename(filePath))
    }
  })

  describe('lint code blocks', () => {
    it('should work as expected', async () => {
      const results = await getCli(true).lintFiles(
        'test/fixtures/code-blocks.{md,mdx}',
      )
      for (const { filePath, messages } of results) {
        expect(messages).toMatchSnapshot(path.basename(filePath))
      }
    })
  })
})
