import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noBlockquoteWithoutMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('no-blockquote-without-marker', noBlockquoteWithoutMarker, {
  valid: [{ code: '> a\n> b', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '> a\nb',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        { message: 'Unexpected blockquote without marker', line: 2, column: 1 },
      ],
    },
  ],
})
