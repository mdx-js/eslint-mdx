import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noFileNameOuterDashes } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
})

ruleTester.run('no file name outer dashes', noFileNameOuterDashes, {
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
      filename: '-bad-name.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected initial or final dashes in file name, expected dashes to join words',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
