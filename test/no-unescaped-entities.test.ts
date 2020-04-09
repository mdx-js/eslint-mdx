import { DEFAULT_PARSER_OPTIONS as parserOptions } from 'eslint-mdx'
import { noUnescapedEntities } from 'eslint-plugin-mdx'

import { parser, ruleTester } from './helper'

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
    {
      // #158
      code: `<YouTube youTubeId="dQw4w9WgXcQ" />
      <Aside>I chose this video to test my theme. I did this to myself</Aside>
      `,
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
      code: '<main>\n<section> > </section></main>',
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
