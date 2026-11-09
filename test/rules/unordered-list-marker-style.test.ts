import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { unorderedListMarkerStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})

ruleTester.run('unordered list marker style', unorderedListMarkerStyle, {
  valid: [
    {
      code: '- item',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '* item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected unordered list marker `*`, expected `-`',
          line: 1,
          column: 1,
        },
      ],
      output: '- item',
    },
  ],
})
