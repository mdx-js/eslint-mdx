import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { definitionCase } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('definition case', definitionCase, {
  valid: [
    {
      code: '[a]: x',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[^A]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected uppercase characters in footnote definition label, expected lowercase',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '[A]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected uppercase characters in definition label, expected lowercase',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
