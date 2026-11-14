import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { blockquoteIndentation } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const fourSpaces = 4
ruleTester.run('blockquote-indentation', blockquoteIndentation, {
  valid: [
    {
      code: '> content',
      filename: 'native.mdx',
      languageOptions,
      options: [2],
    },
    {
      code: '>   content',
      filename: 'native.mdx',
      languageOptions,
      options: [fourSpaces],
    },
    {
      code: '>content',
      filename: 'native.mdx',
      languageOptions,
      options: [1],
    },
    {
      code: '>',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '>   content',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
    },
  ],
  invalid: [
    {
      code: '>content',
      filename: 'native.mdx',
      languageOptions,
      options: [2],
      errors: [
        {
          message:
            'Unexpected `1` space between block quote marker and content, expected `2` spaces, add `1` space',
          line: 1,
          column: 2,
        },
      ],
    },
    {
      code: '> content',
      filename: 'native.mdx',
      languageOptions,
      options: [fourSpaces],
      errors: [
        {
          message:
            'Unexpected `2` spaces between block quote marker and content, expected `4` spaces, add `2` spaces',
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: '>   content',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `4` spaces between block quote marker and content, expected `2` spaces, remove `2` spaces',
          line: 1,
          column: 5,
        },
      ],
    },
  ],
})
