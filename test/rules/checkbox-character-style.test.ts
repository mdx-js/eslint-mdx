import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { checkboxCharacterStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('checkbox-character-style', checkboxCharacterStyle, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
