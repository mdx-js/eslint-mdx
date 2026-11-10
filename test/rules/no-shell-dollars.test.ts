import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noShellDollars } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no shell dollars', noShellDollars, {
  valid: [
    {
      code: '```sh\necho hi\n```',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '```sh\n$ echo hi\n```',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected shell code with every line prefixed by `$`, expected different code for input and output',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
