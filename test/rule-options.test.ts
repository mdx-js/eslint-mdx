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
          'mdx/remark': ['warn', { deprecationWarnings: false }],
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

test('native rules ignore files without remark services', () => {
  const messages = linter.verify(
    'const value = 1',
    [
      {
        files: ['**/*.js'],
        plugins: { mdx: { rules } },
        rules: { 'mdx/no-literal-urls': 'warn' },
      },
    ],
    { filename: 'plain.js' },
  )

  expect(messages).toEqual([])
})

test('enabled: true activates an optionless native rule from ESLint', () => {
  const config: Linter.Config[] = [
    {
      files: ['**/*.mdx'],
      languageOptions: {
        parser,
        parserOptions: DEFAULT_PARSER_OPTIONS,
      },
      plugins: { mdx: { rules } },
      rules: {
        'mdx/no-consecutive-blank-lines': ['warn', { enabled: true }],
      },
    },
  ]

  const enabledMessages = linter.verify('a\n\n\nb', config, {
    filename: 'native.mdx',
  })

  expect(
    enabledMessages.some(
      message => message.ruleId === 'mdx/no-consecutive-blank-lines',
    ),
  ).toBe(true)

  const defaultMessages = linter.verify(
    'a\n\n\nb',
    [
      {
        ...config[0],
        rules: { 'mdx/no-consecutive-blank-lines': 'warn' },
      },
    ],
    { filename: 'native.mdx' },
  )

  expect(
    defaultMessages.some(
      message => message.ruleId === 'mdx/no-consecutive-blank-lines',
    ),
  ).toBe(false)
})
