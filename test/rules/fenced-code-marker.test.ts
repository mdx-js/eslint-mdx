import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { fencedCodeMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('fenced code marker', fencedCodeMarker, {
  valid: [
    {
      code: '```js\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      options: ['`'],
    },
    {
      code: '~~~js\nx()\n~~~',
      filename: 'native.mdx',
      languageOptions,
      options: ['~'],
    },
    {
      code: '```js\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
    },
  ],
  invalid: [
    {
      code: '~~~js\nx()\n~~~',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected fenced code marker `~`, expected `` ` ``',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
