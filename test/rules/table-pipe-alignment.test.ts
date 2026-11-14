import path from 'node:path'

import { Linter } from 'eslint'

import { DEFAULT_PARSER_OPTIONS, ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { parser } from 'eslint-mdx'
import { rules, tablePipeAlignment } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table pipe alignment', tablePipeAlignment, {
  valid: [
    {
      code: '| a | b |\n| - | - |\n| c | d |',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: 'a\n---:',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `3` spaces',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'a\n:-:',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `2` spaces',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '> | Mercury|\n> | - |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `5` spaces (or add `-` to pad alignment row cells)',
          line: 2,
          column: 5,
        },
      ],
    },
    {
      code: '  | a | b |\n  | - | - |\n  | c | dd |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space',
          line: 1,
          column: 11,
        },
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space (or add `-` to pad alignment row cells)',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: '| a | b |\n| - | - |\n| c | dd |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space',
          line: 1,
          column: 9,
        },
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space (or add `-` to pad alignment row cells)',
          line: 2,
          column: 9,
        },
      ],
    },
  ],
})

const linter = new Linter({ configType: 'flat' })
const remarkConfigPath = path.resolve(
  import.meta.dirname,
  '../remark-fixtures/next.remarkrc',
)

const examples = {
  center: '| a | b |\n| :-: | :-: |\n| c | dddd |',
  container: '> | Mercury|\n> | - |',
  crlf: '| Mercury|  \r\n| --- |\r\n| None |',
  missingFences: 'Planet | Satellites\n-: | -\nMercury | ☿',
  noTrailing: 'a | b\n- | -\nc | dd',
  trailingSpaces: '| Planet |  \n| -: | \n',
  widths: '| a | b | c |\n| :- | :-: | -: |\n| d | e | f |',
}

test.each(Object.entries(examples))(
  'table pipe alignment: %s',
  (name, code) => {
    expect(
      linter
        .verify(
          code,
          [
            {
              files: ['**/*.mdx'],
              languageOptions: {
                parser,
                parserOptions: {
                  ...DEFAULT_PARSER_OPTIONS,
                  remarkConfigPath,
                },
              },
              plugins: { mdx: { rules } },
              rules: { 'mdx/table-pipe-alignment': 'warn' },
            },
          ],
          { filename: 'native.mdx' },
        )
        .map(({ column, line, message, ruleId }) => ({
          column,
          line,
          message,
          ruleId,
        })),
    ).toMatchSnapshot(name)
  },
)
