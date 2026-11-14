import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { codeBlockStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })

ruleTester.run('code block style', codeBlockStyle, {
  valid: [
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      options: ['consistent'],
    },
    {
      code: '    x()',
      filename: 'native.md',
      languageOptions,
      options: ['indented'],
    },
    {
      code: '    ```\n    x()\n    ```',
      filename: 'native.md',
      languageOptions,
      options: ['indented'],
    },
  ],
  invalid: [
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      options: ['indented'],
      errors: [
        {
          message:
            'Unexpected fenced code block, expected indented code blocks',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '    x()',
      filename: 'native.md',
      languageOptions,
      options: ['fenced'],
      errors: [
        {
          message:
            'Unexpected indented code block, expected fenced code blocks',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
