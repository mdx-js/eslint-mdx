import path from 'node:path'

import { Linter } from 'eslint'

import { DEFAULT_PARSER_OPTIONS } from '../helpers.js'

import { parser } from 'eslint-mdx'
import { rules } from 'eslint-plugin-mdx'

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
      linter.verify(
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
      ),
    ).toMatchSnapshot(name)
  },
)
