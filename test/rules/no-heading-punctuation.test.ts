import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noHeadingPunctuation } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})

ruleTester.run('no heading punctuation', noHeadingPunctuation, {
  valid: [
    {
      code: '# Heading',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# Heading?',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected character `?` at end of heading, remove it',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
