import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemSpacing } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-spacing', listItemSpacing, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '- a\n\n- b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected blank line between list items, expected no blank lines',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
