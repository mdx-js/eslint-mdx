import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemSpacing } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-spacing', listItemSpacing, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    { code: '- a\n- b', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '- a\n\n- b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `1` blank lines between list items, expected `0` blank lines, remove `1` blank lines',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: '- a\n  continuation\n- b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `0` blank lines between list items, expected `1` blank lines, add `1` blank lines',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
