import { noUnescapedEntities } from '@rxts/eslint-plugin-mdx'

import { parser, parserOptions, ruleTester } from './helper'

const filename = 'no-unescaped-entities.mdx'

ruleTester.run('no-unescaped-entities', noUnescapedEntities, {
  valid: [
    {
      code: '<header> &apos; </header>',
      parser,
      parserOptions,
      filename,
    },
    {
      code: `# Title\n\n## Header <header> &apos; </header>\nMain<main></main>`,
      parser,
      parserOptions,
      filename,
    },
  ],
  invalid: [
    {
      code: '<main> > </main>',
      parser,
      parserOptions,
      filename,
      errors: [
        {
          message: '`>` can be escaped with `&gt;`.',
        },
      ],
    },
    {
      code: 'Main <main> > </main>',
      parser,
      parserOptions,
      filename,
      errors: [
        {
          message: '`>` can be escaped with `&gt;`.',
        },
      ],
    },
    {
      code: 'Main <main> & </main>',
      parser,
      parserOptions,
      options: [
        {
          forbid: ['&'],
        },
      ],
      filename,
      errors: [
        {
          message: 'HTML entity, `&` , must be escaped.',
        },
      ],
    },
  ],
})
