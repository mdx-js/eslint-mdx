import { noFileNameConsecutiveDashes } from 'eslint-plugin-mdx'

import { ruleTester } from '../helpers.js'
import { createLanguageOptions } from './helpers.js'

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
