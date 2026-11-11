import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-indent', listItemIndent, {
  valid: [
    { code: '- item', filename: 'native.mdx', languageOptions },
    { code: '- item\n  continuation', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '-   item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `3` spaces between list item marker and content, expected `1` spaces, remove `2` spaces',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
