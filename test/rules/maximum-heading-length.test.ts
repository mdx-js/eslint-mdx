import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { maximumHeadingLength } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('maximum heading length', maximumHeadingLength, {
  valid: [
    {
      code: '# short',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# this heading is too long',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `24` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
