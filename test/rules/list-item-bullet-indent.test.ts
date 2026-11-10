import { ruleTester } from '../helpers.js'
import { createLanguageOptions } from './helpers.js'
import { listItemBulletIndent } from 'eslint-plugin-mdx'
const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
ruleTester.run('list-item-bullet-indent', listItemBulletIndent, {
  valid: [{ code: '- item', filename: 'native.mdx', languageOptions }],
  invalid: [
    {
      code: '  - item',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message: 'Unexpected `2` spaces before list item, remove `2` spaces',
          line: 1,
          column: 3,
        },
      ],
    },
  ],
})
