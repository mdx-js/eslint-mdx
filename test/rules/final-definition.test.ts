import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { finalDefinition } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('final definition', finalDefinition, {
  valid: [{ code: 'text\n\n[a]: x', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '[a]: x\n\ntext',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected definition before last content, expected definitions after last content',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
