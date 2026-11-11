import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { tablePipes } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table-pipes', tablePipes, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    {
      code: '| a | b |\n| - | - |\n| c | d |',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '| a | b\n| - | - |',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected table row without leading or trailing pipe',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
