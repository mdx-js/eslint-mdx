import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { listItemBulletIndent } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-bullet-indent', listItemBulletIndent, {
  valid: [{ code: '- item', filename: 'native.mdx', languageOptions }],
  invalid: [],
})
