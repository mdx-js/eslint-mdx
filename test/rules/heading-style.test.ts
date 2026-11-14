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
      options: ['atx'],
    },
    {
      code: '# A #',
      filename: 'native.mdx',
      languageOptions,
      options: ['atx-closed'],
    },
    {
      code: 'A\n===',
      filename: 'native.mdx',
      languageOptions,
      options: ['setext'],
    },
  ],
  invalid: [
    {
      code: 'A\n===',
      filename: 'native.mdx',
      languageOptions,
      options: ['atx'],
      errors: [
        {
          message: 'Unexpected setext heading, expected ATX',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# A #',
      filename: 'native.mdx',
      languageOptions,
      options: ['atx'],
      errors: [
        {
          message: 'Unexpected ATX (closed) heading, expected ATX',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# A\n\nB\n===',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
      errors: [
        {
          message: 'Unexpected setext heading, expected ATX',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
