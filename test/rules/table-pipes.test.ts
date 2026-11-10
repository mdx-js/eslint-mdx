import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { tablePipes } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table-pipes', tablePipes, {
  valid: [
    {
      code: '| a | b |\n| - | - |\n| c | d |',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [],
})
