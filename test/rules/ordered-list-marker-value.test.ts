import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { orderedListMarkerValue } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('ordered-list-marker-value', orderedListMarkerValue, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    { code: '1. a\n1. b', filename: 'native.mdx', languageOptions },
    { code: '1.', filename: 'native.mdx', languageOptions },
    { code: '1.\n2. a', filename: 'native.mdx', languageOptions },
    { code: '1. a\n2.\n3. c', filename: 'native.mdx', languageOptions },
    {
      code: '1. a\n1. b',
      filename: 'native.mdx',
      languageOptions,
      options: ['one'],
    },
    {
      code: '3. a\n3. b',
      filename: 'native.mdx',
      languageOptions,
      options: ['single'],
    },
  ],
  invalid: [
    {
      code: '1. a\n2. b',
      filename: 'native.mdx',
      languageOptions,
      options: ['one'],
      errors: [
        {
          message: 'Unexpected ordered list item value `2`, expected `1`',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '3. a\n4. b',
      filename: 'native.mdx',
      languageOptions,
      options: ['single'],
      errors: [
        {
          message: 'Unexpected ordered list item value `4`, expected `3`',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '1. a\n2.\n4. c',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected ordered list item value `4`, expected `3`',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: '1. a\n3. b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected ordered list item value `3`, expected `2`',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
})
