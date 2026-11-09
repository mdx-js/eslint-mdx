import path from 'node:path'

import { languageOptions, ruleTester } from './helpers.js'

import { emphasisMarker, headingIncrement } from 'eslint-plugin-mdx'

const createLanguageOptions = (ignoreRemarkConfig = false) => ({
  ...languageOptions,
  parserOptions: {
    ...languageOptions.parserOptions,
    ...(ignoreRemarkConfig
      ? { ignoreRemarkConfig: true }
      : {
          remarkConfigPath: path.resolve(
            import.meta.dirname,
            'remark-fixtures/native.remarkrc',
          ),
        }),
  },
})

const nativeLanguageOptions = createLanguageOptions()
const noConfigLanguageOptions = createLanguageOptions(true)

ruleTester.run('native remark heading increment', headingIncrement, {
  valid: [
    {
      code: '# A\n\n## B',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      // rule is not enabled without remark config
      code: '# A\n\n### B',
      filename: 'native.mdx',
      languageOptions: noConfigLanguageOptions,
    },
  ],
  invalid: [
    {
      code: '# A\n\n### B',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
      errors: [
        {
          message: 'Unexpected heading rank `3`, exected rank `2`',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})

ruleTester.run('native remark emphasis marker', emphasisMarker, {
  valid: [
    {
      code: '*emphasis*',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      code: '_consistent_',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      // rule is not enabled without remark config
      code: '_emphasis_',
      filename: 'native.mdx',
      languageOptions: noConfigLanguageOptions,
    },
  ],
  invalid: [
    {
      code: '_consistent_ and *other*',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
      errors: [
        {
          message: 'Unexpected emphasis marker `*`, expected `_`',
          line: 1,
          column: 18,
        },
      ],
      output: '_consistent_ and _other_',
    },
  ],
})

it('accepts an explicit emphasis marker option', () => {
  const reports: Array<{ fix?: unknown }> = []
  const listener = emphasisMarker.create({
    report(descriptor: { fix?: unknown }) {
      reports.push(descriptor)
    },
    sourceCode: {
      getText: () => '_emphasis_',
      parserServices: {
        remarkConfig: {
          ruleOptions: { 'emphasis-marker': '*' },
          settings: {},
        },
      },
    },
  } as never)

  listener.MDEmphasis?.({
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
    range: [0, 10],
  } as never)

  expect(reports).toHaveLength(1)
})
