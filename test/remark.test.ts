/* eslint-disable sonarjs/no-duplicate-string */
import path from 'path'

import { DEFAULT_PARSER_OPTIONS as parserOptions } from 'eslint-mdx'
// @ts-ignore - processorCache is an internal API
import { processorCache, remark } from 'eslint-plugin-mdx'
import { homedir } from 'os'

import { parser, ruleTester } from './helpers'

const userDir = homedir()

ruleTester.run('remark 1', remark, {
  valid: [
    {
      code: '<header>Header1</header>',
      parser,
      parserOptions,
      filename: 'remark.mdx',
    },
    {
      code: '<header>Header2</header>',
      parser,
      parserOptions,
      filename: path.resolve(__filename, '0-fake.mdx'),
    },
    {
      code: '<header>Header3</header>',
      parser,
      parserOptions,
      filename: path.resolve(__dirname, 'fixtures/dir.mdx'),
    },
    {
      code: '<header>Header4</header>',
      parser,
      parserOptions,
      filename: path.resolve(userDir, '../test.mdx'),
    },
    {
      code: '<header>Header5</header>',
      parser,
      parserOptions,
      // dark hack
      get filename() {
        processorCache.clear()
        return path.resolve(userDir, '../test.md')
      },
    },
    {
      code: '<header>Header6</header>',
      parser,
      parserOptions,
      filename: path.resolve(__dirname, 'fixtures/async/test.mdx'),
    },
  ],
  invalid: [
    {
      code: '<header>Header</header>',
      parser,
      parserOptions,
      filename: path.resolve(__filename, '0_fake_virtual_filename.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Do not use `_` in a file name',
            source: 'remark-lint',
            ruleId: 'no-file-name-irregular-characters',
            severity: 1,
          }),
          line: null,
          column: 0,
          endLine: null,
          endColumn: 0,
        },
      ],
    },
    {
      // https://github.com/syntax-tree/mdast-util-to-markdown/issues/29
      code: '[CHANGELOG](./CHANGELOG.md)\n',
      parser,
      parserOptions,
      filename: path.resolve(__dirname, 'fixtures/async/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Link to unknown file: `CHANGELOG.md`',
            source: 'remark-validate-links',
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
      parser,
      parserOptions,
      filename: path.resolve(__dirname, 'fixtures/style/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Emphasis should use `*` as a marker',
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
            reason: 'Strong should use `*` as a marker',
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
