import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noFileNameMixedCase } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
})

ruleTester.run('no file name mixed case', noFileNameMixedCase, {
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
      filename: 'BadName.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected mixed case in file name, expected either lowercase or uppercase',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
