import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { strongMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})

ruleTester.run('strong marker', strongMarker, {
  valid: [
    {
      code: '**strong**',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '__strong__',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected strong marker `_`, expected `*`',
          line: 1,
          column: 1,
        },
      ],
      output: '**strong**',
    },
  ],
})
