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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        processorCache.clear()
        return path.resolve(userDir, '../test.md')
      },
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
  ],
})
