import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noDuplicateHeadings } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'more.remarkrc',
})

ruleTester.run('no duplicate headings', noDuplicateHeadings, {
  valid: [
    {
      code: '# A\n\n# B',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# A\n\n# A',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected heading with equivalent text, expected unique headings',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
