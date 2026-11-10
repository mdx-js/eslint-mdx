import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemContentIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-content-indent', listItemContentIndent, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
