import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { maximumLineLength } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('maximum line length', maximumLineLength, {
  valid: [
    { code: 'short', filename: 'native.mdx', languageOptions },
    {
      code: '[abcdefghij](x)',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '{someLongIdentifier + anotherLongIdentifier}',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '---\nthis line is too long\n---',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '<div>this line is too long</div>',
      filename: 'native.md',
      languageOptions,
    },
    {
      code: '```\nthis line is too long\n```',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      filename: 'native.mdx',
      languageOptions,
      options: [{ size: null }],
      errors: [
        {
          message:
            'Unexpected `85` character line, expected at most `80` characters, remove `5` characters',
          line: 1,
          column: 86,
        },
      ],
    },
    {
      code: '<Component>this line is too long</Component>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `44` character line, expected at most `10` characters, remove `34` characters',
          line: 1,
          column: 45,
        },
      ],
    },
    {
      code: 'this line is too long',
      filename: 'native.mdx',
      languageOptions,
      options: [{ size: 10 }],
      errors: [
        {
          message:
            'Unexpected `21` character line, expected at most `10` characters, remove `11` characters',
          line: 1,
          column: 22,
        },
      ],
    },
  ],
})
