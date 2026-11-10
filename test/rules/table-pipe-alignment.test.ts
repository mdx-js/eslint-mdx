import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { tablePipeAlignment } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('table-pipe-alignment', tablePipeAlignment, {
  valid: [{ code: '# A', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
