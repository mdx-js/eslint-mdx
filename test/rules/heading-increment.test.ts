import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { headingIncrement } from 'eslint-plugin-mdx'

const nativeLanguageOptions = createLanguageOptions()
const noConfigLanguageOptions = createLanguageOptions({
  ignoreRemarkConfig: true,
})

ruleTester.run('heading increment', headingIncrement, {
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
