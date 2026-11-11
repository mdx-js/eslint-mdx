import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noDuplicateDefinitions } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no duplicate definitions', noDuplicateDefinitions, {
  valid: [
    {
      code: '[a]: x\n\n[b]: y',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[^a]: x\n\n[^a]: y',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected footnote definition with an already defined identifier (`a`), expected unique identifiers',
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: '[a]: x\n\n[a]: y',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected definition with an already defined identifier (`a`), expected unique identifiers',
          line: 3,
          column: 1,
        },
      ],
    },
  ],
})
