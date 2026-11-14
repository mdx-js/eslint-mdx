import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { checkboxCharacterStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })

ruleTester.run('checkbox character style', checkboxCharacterStyle, {
  valid: [
    {
      code: '- item',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '- [x] item',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '- [x] item',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
    },
    {
      code: '- [x] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'consistent', unchecked: 'consistent' }],
    },
    {
      code: '- [ ] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'consistent', unchecked: 'consistent' }],
    },
    {
      code: '- [X] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'X', unchecked: ' ' }],
    },
    {
      code: '- [\t] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'x', unchecked: '\t' }],
    },
  ],
  invalid: [
    {
      code: '- [X] item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected checked checkbox value `X`, expected `x`',
        },
      ],
    },
    {
      code: '- [x] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'X', unchecked: ' ' }],
      errors: [
        {
          message: 'Unexpected checked checkbox value `x`, expected `X`',
        },
      ],
    },
    {
      code: '- [ ] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'x', unchecked: '\t' }],
      errors: [
        {
          message: 'Unexpected unchecked checkbox value ` `, expected `\\t`',
        },
      ],
    },
    {
      code: '- [\t] item',
      filename: 'native.mdx',
      languageOptions,
      options: [{ checked: 'x', unchecked: ' ' }],
      errors: [
        {
          message: 'Unexpected unchecked checkbox value `\\t`, expected ` `',
        },
      ],
    },
  ],
})
