import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemSpacing } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-spacing', listItemSpacing, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
