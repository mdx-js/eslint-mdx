import { noUnusedExpressions } from 'eslint-plugin-mdx'
import { DEFAULT_PARSER_OPTIONS as parserOptions } from 'eslint-mdx'

import { parser, ruleTester } from './helper'

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
