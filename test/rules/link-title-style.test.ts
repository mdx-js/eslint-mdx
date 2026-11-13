import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { linkTitleStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('link title style', linkTitleStyle, {
  valid: [
    {
      code: '[a](x)',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '[a](x (t))',
      filename: 'native.mdx',
      languageOptions,
      options: ['()'],
    },
    {
      code: '[a](x "t")',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[a](x "t")',
      filename: 'native.mdx',
      languageOptions,
      options: ['()'],
      errors: [
        {
          message: 'Unexpected title markers `"`, expected `()`',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '[a](x "t") [b](y (u))',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
      errors: [
        {
          message: 'Unexpected title markers `()`, expected `"`',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: '[a](x (t))',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected title markers `()`, expected `"`',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: "[a](x 't')",
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected title markers `\'`, expected `"`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
