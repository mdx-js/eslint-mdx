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
  expect(verify('# this heading is too long\n', nextConfigPath)).toHaveLength(1)
})

test('lets eslint options override remark options', () => {
  expect(
    verify('# this heading is too long\n', nextConfigPath, 60),
  ).toHaveLength(0)
})

test('enables a native rule from eslint options alone', () => {
  expect(
    verify('# this heading is too long\n', nativeConfigPath, 5),
  ).toHaveLength(1)
})

const verifyFileExtension = (extensions: string[]) =>
  linter.verify(
    '# A',
    [
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
          parserOptions: {
            ...DEFAULT_PARSER_OPTIONS,
            remarkConfigPath: nextConfigPath,
          },
        },
        plugins: { mdx: { rules } },
        rules: {
          'mdx/file-extension': ['warn', extensions],
        },
      },
    ],
    { filename: 'native.mdx' },
  )

test('uses eslint options for file-extension', () => {
  expect(verifyFileExtension(['mdx'])).toHaveLength(0)
  expect(verifyFileExtension(['txt'])).toHaveLength(1)
})

test('validates no-undefined-references allow through eslint options', () => {
  const messages = linter.verify(
    '[b]',
    [
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
          parserOptions: {
            ...DEFAULT_PARSER_OPTIONS,
            remarkConfigPath: nextConfigPath,
          },
        },
        plugins: { mdx: { rules } },
        rules: {
          'mdx/no-undefined-references': ['warn', { allow: [/^b$/iu] }],
        },
      },
    ],
    { filename: 'native.mdx' },
  )

  expect(messages).toHaveLength(0)
})

test('defaults to the remark fallback', () => {
  const messages = linter.verify(
    '# this heading is too long\n',
    [
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
          parserOptions: {
            ...DEFAULT_PARSER_OPTIONS,
            remarkConfigPath: nextConfigPath,
          },
        },
        plugins: { mdx: { rules } },
        rules: {
          'mdx/remark': 'warn',
        },
      },
    ],
    { filename: 'native.mdx' },
  )

  expect(messages.filter(m => m.ruleId === 'mdx/remark')).toHaveLength(1)
  expect(
    messages.filter(m => m.ruleId === 'mdx/maximum-heading-length'),
  ).toHaveLength(0)
})
