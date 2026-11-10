import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { finalDefinition } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('final-definition', finalDefinition, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
