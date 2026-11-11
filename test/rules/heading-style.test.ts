import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { headingStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('heading style', headingStyle, {
  valid: [
    {
      code: '# A',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: 'A\n===',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected setext heading, expected ATX',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
