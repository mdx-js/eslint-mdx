import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { maximumHeadingLength } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'next.remarkrc',
})

ruleTester.run('maximum heading length', maximumHeadingLength, {
  valid: [
    {
      code: '# short',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '<h1>short</h1>',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '# ![](x) short',
      filename: 'native.mdx',
      languageOptions,
    },
    {
      code: '# <div>x</div>',
      filename: 'native.md',
      languageOptions,
    },
  ],
  invalid: [
    {
      code: '<h1>this heading is too long</h1>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `24` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '<h1>abcdefg{ foo }</h1>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `12` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# <span>hello</span> { expr } **bold**',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `17` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '<h1>{/* c */ abcdef}</h1>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `14` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '<h1>{\n  foo + bar\n}</h1>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `11` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '<h1>hello {expr} world</h1>',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `16` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# <span>hello</span> {expr} **bold**',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `15` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# **bold** `code` [link](x) ![alt](i)',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `18` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '# this heading is too long',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected `24` characters in heading, expected at most `10` characters',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
