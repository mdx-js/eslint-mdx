import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { blockquoteIndentation } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('blockquote-indentation', blockquoteIndentation, {
  valid: [{ code: '> content', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '>   content',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `4` spaces between block quote marker and content, expected `2`',
          line: 1,
          column: 5,
        },
      ],
    },
  ],
})
