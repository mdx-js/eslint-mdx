import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { fencedCodeFlag } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('fenced code flag', fencedCodeFlag, {
  valid: [{ code: '```js\nx()\n```', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected missing fenced code language flag in info string, expected keyword',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
