import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { tableCellPadding } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table-cell-padding', tableCellPadding, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
