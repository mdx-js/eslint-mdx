import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noBlockquoteWithoutMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('no-blockquote-without-marker', noBlockquoteWithoutMarker, {
  valid: [
    { code: 'plain paragraph', filename: 'native.mdx', languageOptions },
    { code: '> a\n> b', filename: 'native.mdx', languageOptions },
    { code: '> > a\n> > b', filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '> a\nb',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `0` block quote markers before paragraph line, expected `1` marker, add `1` marker',
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: '> > a\n> b',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `1` block quote marker before paragraph line, expected `2` markers, add `1` marker',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
})
