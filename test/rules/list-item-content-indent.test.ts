import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemContentIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list item content indent', listItemContentIndent, {
  valid: [
    { code: '- item', filename: 'native.mdx', languageOptions },
    { code: '-', filename: 'native.mdx', languageOptions },
    { code: '- item\n\n  paragraph', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '*\n     asd\n\n  ***',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, add `3` spaces',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: '- item\n\n   paragraph',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, remove `1` space',
          line: 3,
          column: 4,
        },
      ],
    },
    {
      code: '1. [x] Mercury\n     ***\n    * Venus',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, remove `2` spaces',
          line: 2,
          column: 6,
        },
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, remove `1` space',
          line: 3,
          column: 5,
        },
      ],
    },
    {
      code: '- item\n\n    paragraph',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, remove `2` spaces',
          line: 3,
          column: 5,
        },
      ],
    },
  ],
})
