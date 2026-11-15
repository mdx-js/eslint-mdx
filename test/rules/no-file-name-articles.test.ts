import { noFileNameArticles } from 'eslint-plugin-mdx'

import { ruleTester } from '../helpers.js'
import { createLanguageOptions } from './helpers.js'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
})

ruleTester.run('no file name articles', noFileNameArticles, {
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
      filename: 'the-name.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected file name starting with `the`, remove it',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
