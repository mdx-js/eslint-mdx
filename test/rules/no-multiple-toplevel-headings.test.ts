import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noMultipleToplevelHeadings } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no multiple toplevel headings', noMultipleToplevelHeadings, {
  valid: [
    {
      code: '# A\n\n## B',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# A\n\n# B',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected duplicate toplevel heading, exected a single heading with rank `1`',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
