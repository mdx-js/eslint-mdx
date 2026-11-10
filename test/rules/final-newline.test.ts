import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { finalNewline } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('final newline', finalNewline, {
  valid: [
    {
      code: '# A\n',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '# A',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected missing final newline character, expected line feed (`\\n`) at end of file',
          line: 1,
          column: 4,
        },
      ],
      output: '# A\n',
    },
  ],
})
