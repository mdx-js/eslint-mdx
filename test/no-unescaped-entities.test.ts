import { noUnescapedEntities } from 'eslint-plugin-mdx'

import { parser, ruleTester } from './helpers'

const filename = 'no-unescaped-entities.mdx'

ruleTester.run('no-unescaped-entities', noUnescapedEntities, {
  valid: [
    {
      code: '<header> &apos; </header>',
      parser,
      filename,
    },
    {
      code: `# Title\n\n## Header <header> &apos; </header>\nMain<main></main>`,
      parser,
      filename,
    },
    {
      // #158
      code: `<YouTube youTubeId="dQw4w9WgXcQ" />
      <Aside>I chose this video to test my theme. I did this to myself</Aside>
      `,
      parser,
      filename,
    },
    {
      // #217
      code: `<div style={{ color: 'white', backgroundColor: 'black', padding: '24px 32px' }}>

      <a
        style={{
          color: 'white',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: 32
        }}
        href="https://blacklivesmatters.carrd.co/"
      >
        #BlackLivesMatter &rarr;
      </a>

      </div>`,
      parser,
      filename,
    },
  ],
  invalid: [
    {
      code: '<main> > </main>',
      parser,
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
