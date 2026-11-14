import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const mixedOptions = createLanguageOptions({
  remarkConfig: 'shared-options.remarkrc',
})
ruleTester.run('list-item-indent', listItemIndent, {
  valid: [
    { code: '- item', filename: 'native.mdx', languageOptions },
    { code: '-', filename: 'native.mdx', languageOptions },
    { code: '- [x] item', filename: 'native.mdx', languageOptions },
    {
      code: '-\t\t\ta',
      filename: 'native.mdx',
      languageOptions,
      options: ['tab'],
    },
    { code: '- item\n  continuation', filename: 'native.mdx', languageOptions },
    { code: '-     a', filename: 'native.md', languageOptions },
    { code: '-\t\ta', filename: 'native.md', languageOptions },
    {
      code: '-   item\n\n    continued',
      filename: 'native.mdx',
      languageOptions: mixedOptions,
    },
  ],
  invalid: [
    {
      code: '- a\n- b\n\n  c',
      filename: 'native.mdx',
      languageOptions: mixedOptions,
      errors: [
        {
          message:
            'Unexpected `1` space between list item marker and content in loose list, expected `3` spaces, add `2` spaces',
          line: 1,
          column: 3,
        },
        {
          message:
            'Unexpected `1` space between list item marker and content in loose list, expected `3` spaces, add `2` spaces',
          line: 2,
          column: 3,
        },
      ],
    },
    {
      code: '- a\n  - b\n\n  - c',
      filename: 'native.mdx',
      languageOptions: mixedOptions,
      errors: [
        {
          message:
            'Unexpected `1` space between list item marker and content in loose list, expected `3` spaces, add `2` spaces',
          line: 2,
          column: 5,
        },
        {
          message:
            'Unexpected `1` space between list item marker and content in loose list, expected `3` spaces, add `2` spaces',
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: '-   item',
      filename: 'native.mdx',
      languageOptions: mixedOptions,
      errors: [
        {
          message:
            'Unexpected `3` spaces between list item marker and content in tight list, expected `1` space, remove `2` spaces',
          line: 1,
          column: 5,
        },
      ],
    },
    {
      code: '- item\n\n  continued',
      filename: 'native.mdx',
      languageOptions: mixedOptions,
      errors: [
        {
          message:
            'Unexpected `1` space between list item marker and content in loose list, expected `3` spaces, add `2` spaces',
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: '- a',
      filename: 'native.mdx',
      languageOptions,
      options: ['tab'],
      errors: [
        {
          message:
            'Unexpected `1` space between list item marker and content, expected `3` spaces, add `2` spaces',
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: '-   item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `3` spaces between list item marker and content, expected `1` space, remove `2` spaces',
          line: 1,
          column: 5,
        },
      ],
    },
  ],
})
