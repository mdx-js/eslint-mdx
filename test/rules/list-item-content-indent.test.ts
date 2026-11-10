import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemContentIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list item content indent', listItemContentIndent, {
  valid: [
    { code: '- item\n  continuation', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '- item\n    continuation',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned list item child, expected to align with first child, remove `2` spaces',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
