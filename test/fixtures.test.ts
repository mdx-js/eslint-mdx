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
              // related to https://github.com/eslint/eslint/issues/14207
              rules: {
                'prettier/prettier': 0,
              },
              settings: {
                'mdx/code-blocks': true,
              },
            },
          ]
        : [],
    },
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
