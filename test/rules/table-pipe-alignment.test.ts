import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { tablePipeAlignment } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table pipe alignment', tablePipeAlignment, {
  valid: [
    {
      code: '| a | b |\n| - | - |\n| c | d |',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '| a | b |\n| - | - |\n| c | dd |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected unaligned cell, expected aligned pipes',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
