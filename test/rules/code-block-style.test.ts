import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { codeBlockStyle } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('code block style', codeBlockStyle, {
  valid: [{ code: '```\nx()\n```', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
