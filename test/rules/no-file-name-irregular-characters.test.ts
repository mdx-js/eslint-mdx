import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noFileNameIrregularCharacters } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
})
const defaultOptions = createLanguageOptions({
  remarkConfig: 'default-options.remarkrc',
})

ruleTester.run(
  'no file name irregular characters',
  noFileNameIrregularCharacters,
  {
    valid: [
      {
        code: '# A',
        filename: 'good-name.mdx',
        languageOptions,
      },
      {
        code: '# A',
        filename: 'good-name.mdx',
        languageOptions: defaultOptions,
      },
      {
        code: '# A',
        filename: 'good-name.mdx',
        languageOptions,
        options: [null],
      },
      {
        code: '# A',
        filename: 'good-name.mdx',
        languageOptions,
        options: ['a-z-'],
      },
      {
        code: '# A',
        filename: 'good-name.mdx',
        languageOptions,
        options: [/[^a-z-]/u],
      },
    ],
    invalid: [
      {
        code: '# A',
        filename: 'bad_name.mdx',
        languageOptions,
        options: ['a-z-'],
        errors: [
          {
            message: 'Unexpected character `_` in file name',
            line: 1,
            column: 1,
          },
        ],
      },
      {
        code: '# A',
        filename: 'bad_name.mdx',
        languageOptions,
        options: [/[^a-z-]/u],
        errors: [
          {
            message: 'Unexpected character `_` in file name',
            line: 1,
            column: 1,
          },
        ],
      },
      {
        code: '# A',
        filename: 'bad_name.mdx',
        languageOptions: defaultOptions,
        errors: [
          {
            message: 'Unexpected character `_` in file name',
            line: 1,
            column: 1,
          },
        ],
      },
      {
        code: '# A',
        filename: 'bad_name.mdx',
        languageOptions,
        errors: [
          {
            message: 'Unexpected character `_` in file name',
            line: 1,
            column: 1,
          },
        ],
      },
    ],
  },
)
