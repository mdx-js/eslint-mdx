import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { orderedListMarkerValue } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('ordered-list-marker-value', orderedListMarkerValue, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '1. a\n3. b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected ordered list marker value `3`, expected `2`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
