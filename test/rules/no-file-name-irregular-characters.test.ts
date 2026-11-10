import { ruleTester } from '../helpers.js'

import { createLanguageOptions } from './helpers.js'

import { noFileNameIrregularCharacters } from 'eslint-plugin-mdx'

const languageOptions = createLanguageOptions({
  remarkConfig: 'file-names.remarkrc',
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
    ],
    invalid: [
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
