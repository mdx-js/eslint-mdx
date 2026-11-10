import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noLiteralUrls } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no literal urls', noLiteralUrls, {
  valid: [
    {
      code: '[https://example.com](https://example.com)',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: 'https://example.com',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular autolink, add `<` before and `>` after',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
