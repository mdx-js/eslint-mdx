import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { fencedCodeFlag } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({ remarkConfig: 'next.remarkrc' })
const allowOptions = createLanguageOptions({
  remarkConfig: 'fenced-code-allow.remarkrc',
})
const flagsOptions = createLanguageOptions({
  remarkConfig: 'fenced-code-flags.remarkrc',
})
const manyOptions = createLanguageOptions({
  remarkConfig: 'fenced-code-many.remarkrc',
})
const arrayOptions = createLanguageOptions({
  remarkConfig: 'fenced-code-array.remarkrc',
})
ruleTester.run('fenced code flag', fencedCodeFlag, {
  valid: [
    { code: '```js\nx()\n```', filename: 'native.mdx', languageOptions },
    { code: '    x()', filename: 'native.md', languageOptions },
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions: allowOptions,
    },
    {
      code: '```js\nx()\n```',
      filename: 'native.mdx',
      languageOptions: flagsOptions,
    },
    {
      code: '```js\nx()\n```',
      filename: 'native.mdx',
      languageOptions: arrayOptions,
    },
    {
      code: '```js\nx()\n```',
      filename: 'native.mdx',
      languageOptions: manyOptions,
    },
  ],
  invalid: [
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions,
      errors: [
        {
          message:
            'Unexpected missing fenced code language flag in info string, expected keyword',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '```\nx()\n```',
      filename: 'native.mdx',
      languageOptions: flagsOptions,
      errors: [
        {
          message:
            'Unexpected missing fenced code language flag in info string, expected `js`',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '```html\nx()\n```',
      filename: 'native.mdx',
      languageOptions: manyOptions,
      errors: [
        {
          message:
            'Unexpected fenced code language flag `html` in info string, expected `js`, `ts`, `md`, …',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: '```html\nx()\n```',
      filename: 'native.mdx',
      languageOptions: flagsOptions,
      errors: [
        {
          message:
            'Unexpected fenced code language flag `html` in info string, expected `js`',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
})
