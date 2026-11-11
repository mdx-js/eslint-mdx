import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { checkboxCharacterStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('checkbox character style', checkboxCharacterStyle, {
  valid: [{ code: '- [x] item', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '- [X] item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected checked checkbox value `X`, expected `x`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
