import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { orderedListMarkerStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('ordered list marker style', orderedListMarkerStyle, {
  valid: [
    {
      code: '1) item',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '1. item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected ordered list marker `.`, expected `)`',
          line: 1,
          column: 2,
        },
      ],
      output: '1) item',
    },
  ],
})
