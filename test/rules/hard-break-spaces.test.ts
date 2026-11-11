import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { hardBreakSpaces } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const escapeOptions = createLanguageOptions({
  remarkConfig: 'hard-break-escape.remarkrc',
})
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
          column: 2,
        },
      ],
    },
    {
      code: 'a  \nb',
      filename: 'native.mdx',
      languageOptions: escapeOptions,
      errors: [
        {
          message: 'Unexpected `2` spaces for hard break, expected escape',
          line: 1,
          column: 2,
        },
      ],
    },
  ],
})
