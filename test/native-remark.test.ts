import path from 'node:path'

import { languageOptions, ruleTester } from './helpers.js'

import { nativeEmphasisMarker, nativeHeadingIncrement } from 'eslint-plugin-mdx'

const emptyLanguageOptions = {
  ...languageOptions,
  parserOptions: {
    ...languageOptions.parserOptions,
    remarkConfigPath: path.resolve(
      import.meta.dirname,
      'remark-fixtures/empty.remarkrc',
    ),
  },
}

const nativeLanguageOptions = {
  ...languageOptions,
  parserOptions: {
    ...languageOptions.parserOptions,
    remarkConfigPath: path.resolve(
      import.meta.dirname,
      'remark-fixtures/native.remarkrc',
    ),
  },
}

ruleTester.run('native remark heading increment', nativeHeadingIncrement, {
  valid: [
    {
      code: '# A\n\n## B',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      // rule is not enabled in remark config
      code: '# A\n\n### B',
      filename: 'native.mdx',
      languageOptions: emptyLanguageOptions,
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

ruleTester.run('native remark emphasis marker', nativeEmphasisMarker, {
  valid: [
    {
      code: '*emphasis*',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      // rule is not enabled in remark config
      code: '_emphasis_',
      filename: 'native.mdx',
      languageOptions: emptyLanguageOptions,
    },
  ],
  invalid: [
    {
      code: '_emphasis_',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
      errors: [
        {
          message: 'Unexpected emphasis marker `_`, expected `*`',
          line: 1,
          column: 1,
        },
      ],
      output: '*emphasis*',
    },
  ],
})
