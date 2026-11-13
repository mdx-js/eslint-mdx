import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { fileExtension } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('file extension', fileExtension, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    {
      code: '# A',
      filename: 'native.mdx',
      languageOptions: createLanguageOptions({ ignoreRemarkConfig: true }),
    },
  ],
  invalid: [
    {
      code: '# A',
      filename: 'native.txt',
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...languageOptions.parserOptions,
          extensions: ['.txt'],
        },
      },
      errors: [
        {
          message: 'Unexpected file extension `txt`, expected `mdx`, `md`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
