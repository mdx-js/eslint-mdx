import { homedir } from 'node:os'
import path from 'node:path'

import { ruleTester, languageOptions } from './helpers.js'

import { remark } from 'eslint-plugin-mdx'

const userDir = homedir()

const _dirname = import.meta.dirname
const _filename = import.meta.filename

ruleTester.run('remark', remark, {
  valid: [
    {
      code: '<header>Header1</header>',
      languageOptions,
      filename: 'remark.mdx',
    },
    {
      code: '<header>Header2</header>',
      languageOptions,
      filename: path.resolve(_filename, '0-fake.mdx'),
    },
    {
      code: '<header>Header3</header>',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/dir.mdx'),
    },
    {
      code: '<header>Header4</header>',
      languageOptions,
      filename: path.resolve(userDir, '../test.mdx'),
    },
    {
      code: '<header>Header5</header>',
      languageOptions,
      filename: path.resolve(userDir, '../test.md'),
    },
    {
      code: '<header>Header6</header>',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/async/test.mdx'),
    },
    {
      code: '_emphasis_ and __strong__',
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...languageOptions.parserOptions,
          ignoreRemarkConfig: true,
        },
      },
      filename: path.resolve(_dirname, 'fixtures/style/test.mdx'),
    },
  ],
  invalid: [
    {
      // https://github.com/syntax-tree/mdast-util-to-markdown/issues/29
      code: '[CHANGELOG](./CHANGELOG.md)\n',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/async/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Cannot find file `CHANGELOG.md`',
            source: 'remark-validate-links:missing-file',
            ruleId: 'missing-file',
            severity: 1,
          }),
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 28,
        },
      ],
    },
    {
      code: `_emphasis_ and __strong__`,
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/style/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Unexpected emphasis marker `_`, expected `*`',
            source: 'remark-lint',
            ruleId: 'emphasis-marker',
            severity: 1,
          }),
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 11,
        },
        {
          message: JSON.stringify({
            reason: 'Unexpected strong marker `_`, expected `*`',
            source: 'remark-lint',
            ruleId: 'strong-marker',
            severity: 1,
          }),
          line: 1,
          column: 16,
          endLine: 1,
          endColumn: 26,
        },
      ],
      output: '*emphasis* and **strong**\n',
    },
  ],
})

test('hack', () => {
  expect(true).toBe(true)
})
