import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noUndefinedReferences } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('no-undefined-references', noUndefinedReferences, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
