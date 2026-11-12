import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noUndefinedReferences } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const allowOptions = createLanguageOptions({
  remarkConfig: 'no-undefined-allow.remarkrc',
})
const regexOptions = createLanguageOptions({
  remarkConfig: 'no-undefined-regex.remarkrc',
})
const regexpOptions = createLanguageOptions({
  remarkConfig: 'no-undefined-regexp.remarkrc.js',
})
ruleTester.run('no-undefined-references', noUndefinedReferences, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    { code: '[a][b]\n\n[b]: x', filename: 'native.mdx', languageOptions },
    { code: String.raw`\[a\]`, filename: 'native.mdx', languageOptions },
    { code: '[a]', filename: 'native.mdx', languageOptions: allowOptions },
    { code: '[c]', filename: 'native.mdx', languageOptions: allowOptions },
    { code: '[b]', filename: 'native.mdx', languageOptions: regexOptions },
    { code: '[b]', filename: 'native.mdx', languageOptions: regexpOptions },
    { code: '[', filename: 'native.mdx', languageOptions },
    { code: ']', filename: 'native.mdx', languageOptions },
    { code: '[]', filename: 'native.mdx', languageOptions },
    { code: '[x][', filename: 'native.mdx', languageOptions },
    { code: '[^a b]', filename: 'native.mdx', languageOptions },
    { code: String.raw`\a`, filename: 'native.mdx', languageOptions },
  ],
  invalid: [
    {
      code: '[a][b]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected reference to undefined definition, expected corresponding definition (`b`) for a link or escaped opening bracket (`\\[`) for regular text',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '![a][b]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected reference to undefined definition, expected corresponding definition (`b`) for an image or escaped opening bracket (`\\[`) for regular text',
          line: 1,
          column: 2,
        },
      ],
    },
    {
      code: '[^x]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected reference to undefined definition, expected corresponding definition (`x`) for a footnote or escaped opening bracket (`\\[`) for regular text',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '[c]',
      filename: 'native.mdx',
      languageOptions: regexpOptions,
      errors: [
        {
          message:
            'Unexpected reference to undefined definition, expected corresponding definition (`c`) for a link or escaped opening bracket (`\\[`) for regular text',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '[a]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected reference to undefined definition, expected corresponding definition (`a`) for a link or escaped opening bracket (`\\[`) for regular text',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
