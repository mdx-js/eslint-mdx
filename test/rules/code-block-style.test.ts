import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { codeBlockStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const indentedOptions = createLanguageOptions({
  remarkConfig: 'code-block-indented.remarkrc',
})
ruleTester.run('code block style', codeBlockStyle, {
  valid: [{ code: '```\nx()\n```', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions: indentedOptions,
      errors: [
        {
          message:
            'Unexpected fenced code block, expected indented code blocks',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
