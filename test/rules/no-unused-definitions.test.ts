import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noUnusedDefinitions } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no unused definitions', noUnusedDefinitions, {
  valid: [
    {
      code: '[a]\n\n[a]: x',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[^a]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unused footnote definition, expected no definition or one or more footnote references to `a`',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '[a]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected unused definition, expected no definition or one or more references to `a`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
