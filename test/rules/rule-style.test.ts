import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { ruleStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('rule style', ruleStyle, {
  valid: [
    {
      code: '***',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '* * *',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected thematic rule `* * *`, expected `***`',
          line: 1,
          column: 1,
        },
      ],
      output: '***',
    },
  ],
})
