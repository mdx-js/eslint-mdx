import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noBlockquoteWithoutMarker } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('no-blockquote-without-marker', noBlockquoteWithoutMarker, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
