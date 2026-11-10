import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { definitionSpacing } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('definition spacing', definitionSpacing, {
  valid: [
    {
      code: '[a b]: x',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[a  b]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `2` consecutive spaces in definition label, expected `1` space, remove `1` spaces',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
