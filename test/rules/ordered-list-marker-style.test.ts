import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { orderedListMarkerStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})
const consistentOptions = createLanguageOptions({
  remarkConfig: 'shared-options.remarkrc',
})

ruleTester.run('ordered list marker style', orderedListMarkerStyle, {
  valid: [
    { code: '- item', filename: 'native.mdx', languageOptions },
    {
      code: '1. a\n\n2. b',
      filename: 'native.mdx',
      languageOptions: consistentOptions,
    },
    {
      code: '1) item',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '1. a\n\n2) b',
      filename: 'native.mdx',
      languageOptions: consistentOptions,
      errors: [
        {
          message: 'Unexpected ordered list marker `)`, expected `.`',
          line: 3,
          column: 2,
        },
      ],
      output: '1. a\n\n2. b',
    },
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
