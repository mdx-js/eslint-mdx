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
      code: '> | Mercury|\n> | - |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `5` spaces (or add `-` to pad alignment row cells)',
          line: 2,
          column: 5,
        },
      ],
    },
    {
      code: '  | a | b |\n  | - | - |\n  | c | dd |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space',
          line: 1,
          column: 11,
        },
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space (or add `-` to pad alignment row cells)',
          line: 2,
          column: 9,
        },
      ],
    },
    {
      code: '| a | b |\n| - | - |\n| c | dd |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space',
          line: 1,
          column: 9,
        },
        {
          message:
            'Unexpected unaligned cell, expected aligned pipes, add `1` space (or add `-` to pad alignment row cells)',
          line: 2,
          column: 9,
        },
      ],
    },
  ],
})
