import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noShortcutReferenceLink } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no shortcut reference link', noShortcutReferenceLink, {
  valid: [
    {
      code: '[a][]\n\n[a]: x',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '[a]\n\n[a]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected shortcut reference link (`[text]`), expected collapsed reference (`[text][]`)',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
