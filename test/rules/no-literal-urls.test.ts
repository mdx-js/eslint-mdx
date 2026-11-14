import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noLiteralUrls } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no literal urls', noLiteralUrls, {
  valid: [
    {
      code: '<https://example.com>',
      filename: 'native.md',
      languageOptions,
    },
    {
      code: '[https://example.com](https://example.com)',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: 'www.example.com',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular link, use `[text](url)` instead or escape it with `\\<`',
        },
      ],
    },
    {
      code: 'example@example.com',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular link, use `[text](url)` instead or escape it with `\\<`',
        },
      ],
    },
    {
      code: 'https://example.com',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular link, use `[text](url)` instead or escape it with `\\<`',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'www.example.com',
      filename: 'native.md',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular autolink, add `<http://` before and `>` after',
        },
      ],
    },
    {
      code: 'https://example.com',
      filename: 'native.md',
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...languageOptions.parserOptions,
          extensions: ['.md'],
        },
      },
      errors: [
        {
          message:
            'Unexpected GFM autolink literal, expected regular link, use `[text](url)` instead or escape it with `\\<`',
        },
      ],
    },
    {
      code: 'https://example.com',
      filename: 'native.md',
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
