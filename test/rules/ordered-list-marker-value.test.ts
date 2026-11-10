import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { orderedListMarkerValue } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('ordered-list-marker-value', orderedListMarkerValue, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
