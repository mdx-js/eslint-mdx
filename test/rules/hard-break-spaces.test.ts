import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { hardBreakSpaces } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('hard break spaces', hardBreakSpaces, {
  valid: [{ code: 'a  \nb', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: 'a   \nb',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected `3` spaces for hard break, expected `2` spaces',
          line: 1,
          column: 5,
        },
      ],
    },
  ],
})
