import path from 'node:path'

import { jest } from '@jest/globals'
import { Linter } from 'eslint'
import { parser } from 'eslint-mdx'
import { rules } from 'eslint-plugin-mdx'

import { DEFAULT_PARSER_OPTIONS } from './helpers.js'

const noop = () => false

const _dirname = import.meta.dirname
const remarkConfigPath = path.resolve(_dirname, 'remark-fixtures/native.remarkrc')
const linter = new Linter({ configType: 'flat' })

const verify = (deprecationWarnings?: boolean) =>
  linter.verify(
    '# A\n### B\n',
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
          'mdx/remark': ['warn', deprecationWarnings === undefined ? {} : { deprecationWarnings }],
        },
      },
    ],
    { filename: 'native.mdx' },
  )

test('deprecationWarnings: false suppresses the fallback fix warning', () => {
  const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(noop)

  try {
    const messages = verify(false)

    expect(messages.some(message => message.fix)).toBe(true)
    expect(emitWarning).not.toHaveBeenCalled()
  } finally {
    emitWarning.mockRestore()
  }
})

test('warns once when a fallback fix is computed', () => {
  const emitWarning = jest.spyOn(process, 'emitWarning').mockImplementation(noop)

  try {
    const first = verify()
    const second = verify()

    expect(first.some(message => message.fix)).toBe(true)
    expect(second.some(message => message.fix)).toBe(true)
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
