import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemBulletIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-bullet-indent', listItemBulletIndent, {
  valid: [
    { code: '- item', filename: 'native.mdx', languageOptions },
    { code: '- item\n  - nested', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '  - item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `2` spaces before list item, expected `0` spaces, remove them',
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: ' - item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `1` space before list item, expected `0` spaces, remove them',
          line: 1,
          column: 2,
        },
      ],
    },
  ],
})
