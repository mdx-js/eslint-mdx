import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { strongMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})

ruleTester.run('strong marker', strongMarker, {
  valid: [
    {
      code: '__strong__',
      filename: 'native.mdx',
      languageOptions,
      options: ['_'],
    },
    {
      code: '**strong**',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
    },
    {
      code: '**strong**',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '**strong**',
      filename: 'native.mdx',
      languageOptions,
      options: ['_'],
      errors: [
        {
          message: 'Unexpected strong marker `*`, expected `_`',
          line: 1,
          column: 1,
        },
      ],
      output: '__strong__',
    },
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
