import { noUnusedExpressions } from '@rxts/eslint-plugin-mdx'

import { parser, parserOptions, ruleTester } from './helper'

ruleTester.run('no-unused-expressions', noUnusedExpressions, {
  valid: [
    {
      code: '<header>Header</header>',
      parser,
      parserOptions,
      filename: 'no-unused-expressions.mdx',
    },
  ],
  invalid: [
    {
      code: 'if(0) 0',
      parser,
      parserOptions,
      filename: 'no-unused-expressions.js',
      errors: [
        {
          message:
            'Expected an assignment or function call and instead saw an expression.',
        },
      ],
    },
  ],
})
