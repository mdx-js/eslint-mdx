import path from 'node:path'

import { jest } from '@jest/globals'
import { Linter } from 'eslint'

import { DEFAULT_PARSER_OPTIONS } from './helpers.js'

import { parser } from 'eslint-mdx'
import { rules } from 'eslint-plugin-mdx'

const noop = () => false

const _dirname = import.meta.dirname
const remarkConfigPath = path.resolve(
  _dirname,
  'remark-fixtures/native.remarkrc',
)
const linter = new Linter({ configType: 'flat' })

const verify = (deprecationWarnings?: boolean) =>
  linter.verify(
    '_a_ *b*\n',
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
          'mdx/remark': [
            'warn',
            deprecationWarnings === undefined ? {} : { deprecationWarnings },
          ],
        },
      },
    ],
    { filename: 'native.mdx' },
  )

test('deprecationWarnings: false suppresses the fallback fix warning', () => {
  const emitWarning = jest
    .spyOn(process, 'emitWarning')
    .mockImplementation(noop)

  try {
    expect(verify(false).length).toBeGreaterThan(0)
    expect(emitWarning).not.toHaveBeenCalled()
  } finally {
    emitWarning.mockRestore()
  }
})

test('warns once when a fallback fix is computed', () => {
  const emitWarning = jest
    .spyOn(process, 'emitWarning')
    .mockImplementation(noop)

  try {
    expect(verify().length).toBeGreaterThan(0)
    expect(emitWarning).toHaveBeenCalledTimes(1)
    expect(emitWarning).toHaveBeenCalledWith(
      expect.stringContaining('deprecated'),
      expect.objectContaining({
        code: 'ESLINT_MDX_DEPRECATED_REMARK_FIX',
      }),
    )
  } finally {
    emitWarning.mockRestore()
  }
})

test('does not warn again in the same process', () => {
  const emitWarning = jest
    .spyOn(process, 'emitWarning')
    .mockImplementation(noop)

  try {
    expect(verify().length).toBeGreaterThan(0)
    expect(emitWarning).not.toHaveBeenCalled()
  } finally {
    emitWarning.mockRestore()
  }
})
