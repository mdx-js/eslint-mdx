import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-indent', listItemIndent, {
  valid: [
    { code: '- item\n  continuation', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '- item\n   continuation',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected `3` spaces for list item indent, expected `2`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
