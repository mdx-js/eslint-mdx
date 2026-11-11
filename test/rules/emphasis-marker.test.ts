import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { emphasisMarker } from 'eslint-plugin-mdx'

const nativeLanguageOptions = createLanguageOptions()
const explicitLanguageOptions = createLanguageOptions({
  remarkConfig: 'emphasis-marker.remarkrc',
})
const noConfigLanguageOptions = createLanguageOptions({
  ignoreRemarkConfig: true,
})

ruleTester.run('emphasis marker', emphasisMarker, {
  valid: [
    {
      code: '*emphasis*',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      code: '_consistent_',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
    },
    {
      // rule is not enabled without remark config
      code: '_emphasis_',
      filename: 'native.mdx',
      languageOptions: noConfigLanguageOptions,
    },
  ],
  invalid: [
    {
      code: '_consistent_ and *other*',
      filename: 'native.mdx',
      languageOptions: nativeLanguageOptions,
      errors: [
        {
          message: 'Unexpected emphasis marker `*`, expected `_`',
          line: 1,
          column: 18,
        },
      ],
      output: '_consistent_ and _other_',
    },
    {
      // explicit marker option
      code: '_emphasis_',
      filename: 'native.mdx',
      languageOptions: explicitLanguageOptions,
      errors: [
        {
          message: 'Unexpected emphasis marker `_`, expected `*`',
          line: 1,
          column: 1,
        },
      ],
      output: '*emphasis*',
    },
  ],
})
