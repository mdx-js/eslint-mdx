import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noUndefinedReferences } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('no-undefined-references', noUndefinedReferences, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    { code: '[a][b]\n\n[b]: x', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '[a][b]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected reference to undefined definition `b`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
