import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noDuplicateHeadingsInSection } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run(
  'no duplicate headings in section',
  noDuplicateHeadingsInSection,
  {
    valid: [
      {
        code: '# A\n\n## B\n\n# C\n\n## B',
        filename: 'native.mdx',
        languageOptions,
      },
    ],
    invalid: [
      {
        code: '## A\n\n## A',
        filename: 'native.mdx',
        languageOptions,
        errors: [
          {
            message:
              'Unexpected heading with equivalent text in section, expected unique headings',
            line: 3,
            column: 1,
          },
        ],
      },
    ],
  },
)
