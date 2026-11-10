import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noFileNameConsecutiveDashes } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
})

ruleTester.run('no file name consecutive dashes', noFileNameConsecutiveDashes, {
  valid: [
    {
      code: '# A',
      filename: 'good-name.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# A',
      filename: 'bad--name.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected consecutive dashes in a file name, expected `-`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
