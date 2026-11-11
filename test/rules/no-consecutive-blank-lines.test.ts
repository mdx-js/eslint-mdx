import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noConsecutiveBlankLines } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no consecutive blank lines', noConsecutiveBlankLines, {
  valid: [
    {
      code: '# A\n\n# B',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# A\n\n\n# B',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `2` blank lines before node, expected up to `1` blank line, remove `1` blank line',
          line: 4,
          column: 1,
        },
      ],
    },
  ],
})
