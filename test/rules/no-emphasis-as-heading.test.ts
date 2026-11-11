import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noEmphasisAsHeading } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no emphasis as heading', noEmphasisAsHeading, {
  valid: [
    {
      code: '*em*',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '*em*\n\n# Heading',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '*em* text\n\ntext',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '*em*\n\ntext',
      filename: 'native.mdx',
      languageOptions: createLanguageOptions({ ignoreRemarkConfig: true }),
    },
  ],
  invalid: [
    {
      code: '*em*\n\ntext',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected emphasis introducing a section, expected a heading instead',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '**strong**\n\ntext',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected strong introducing a section, expected a heading instead',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
