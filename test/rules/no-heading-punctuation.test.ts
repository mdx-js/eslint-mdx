import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noHeadingPunctuation } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})
const defaultOptions = createLanguageOptions({
  remarkConfig: 'default-options.remarkrc',
})

ruleTester.run('no heading punctuation', noHeadingPunctuation, {
  valid: [
    {
      code: '# Heading',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '# Heading',
      filename: 'native.mdx',
      languageOptions: defaultOptions,
    },
    {
      code: '# Heading',
      filename: 'native.mdx',
      languageOptions,
      options: [null],
    },
    {
      code: '# Heading',
      filename: 'native.mdx',
      languageOptions,
      options: [/\?/u],
    },
  ],
  invalid: [
    {
      code: '# Heading?',
      filename: 'native.mdx',
      languageOptions: defaultOptions,
      errors: [
        {
          message: 'Unexpected character `?` at end of heading, remove it',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# Heading?',
      filename: 'native.mdx',
      languageOptions,
      options: [/\?/u],
      errors: [
        {
          message: 'Unexpected character `?` at end of heading, remove it',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# Heading?',
      filename: 'native.mdx',
      languageOptions: defaultOptions,
      errors: [
        {
          message: 'Unexpected character `?` at end of heading, remove it',
          line: 1,
          column: 1,
        },
      ],
    },
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
