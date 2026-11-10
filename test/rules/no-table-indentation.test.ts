import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noTableIndentation } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no table indentation', noTableIndentation, {
  valid: [
    {
      code: '| a | b |\n| - | - |\n| c | d |',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '| a | b |\n| - | - |\n  | c | d |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `2` extra spaces before table row, remove `2` spaces',
          line: 3,
          column: 2,
        },
      ],
    },
    {
      code: '| a | b |\n| - | - |\n | c | d |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `1` extra space before table row, remove `1` space',
          line: 3,
          column: 2,
        },
      ],
    },
  ],
})
