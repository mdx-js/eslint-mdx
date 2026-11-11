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
ruleTester.run('no-undefined-references', noUndefinedReferences, {
  valid: [
    { code: '# A', filename: 'native.mdx', languageOptions },
    { code: '[a][b]\n\n[b]: x', filename: 'native.mdx', languageOptions },
    { code: String.raw`\[a\]`, filename: 'native.mdx', languageOptions },
    { code: '[a]', filename: 'native.mdx', languageOptions: allowOptions },
    { code: '[c]', filename: 'native.mdx', languageOptions: allowOptions },
    { code: '[b]', filename: 'native.mdx', languageOptions: regexOptions },
  ],
  invalid: [
    {
      code: '[a][b]',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected reference to undefined definition `b`',
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
          message: 'Unexpected reference to undefined definition `a`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
