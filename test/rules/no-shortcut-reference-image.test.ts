import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noShortcutReferenceImage } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('no shortcut reference image', noShortcutReferenceImage, {
  valid: [
    {
      code: '![a][]\n\n[a]: x',
      filename: 'native.mdx',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '![a]\n\n[a]: x',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected shortcut reference image (`![text]`), expected collapsed reference (`![text][]`)',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
