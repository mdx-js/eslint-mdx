import path from 'node:path'

import { Linter } from 'eslint'

import { DEFAULT_PARSER_OPTIONS } from './helpers.js'

import { parser } from 'eslint-mdx'
import { rules } from 'eslint-plugin-mdx'

const _dirname = import.meta.dirname
const linter = new Linter({ configType: 'flat' })
const nextConfigPath = path.resolve(_dirname, 'remark-fixtures/next.remarkrc')
const nativeConfigPath = path.resolve(
  _dirname,
  'remark-fixtures/native.remarkrc',
)

const verify = (code: string, remarkConfigPath: string, option?: number) =>
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
        rules: {
          'mdx/maximum-heading-length':
            option == null ? 'warn' : ['warn', option],
        },
      },
    ],
    { filename: 'native.mdx' },
  )

test('uses remark options when no eslint option is provided', () => {
  expect(verify('# this heading is too long', nextConfigPath)).toHaveLength(1)
})

test('lets eslint options override remark options', () => {
  expect(verify('# this heading is too long', nextConfigPath, 60)).toHaveLength(
    0,
  )
})

test('enables a native rule from eslint options alone', () => {
  expect(
    verify('# this heading is too long', nativeConfigPath, 5),
  ).toHaveLength(1)
})
