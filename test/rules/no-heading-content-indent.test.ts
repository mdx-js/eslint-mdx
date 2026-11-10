import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noHeadingContentIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no heading content indent', noHeadingContentIndent, {
  valid: [
    {
      code: 'Title\n=====',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '#  A',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `2` spaces between hashes and content, expected `1` space, remove `1` spaces',
          line: 1,
          column: 2,
        },
      ],
      output: '# A',
    },
  ],
})
