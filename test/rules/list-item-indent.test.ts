import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-indent', listItemIndent, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
