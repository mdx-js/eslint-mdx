import path from 'node:path'

import { languageOptions, ruleTester } from './helpers.js'

import { remark } from 'eslint-plugin-mdx'

ruleTester.run('remark filters native rules', remark, {
  valid: [
    {
      code: '# A\n\n### B',
      filename: 'native-filter.mdx',
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...languageOptions.parserOptions,
          remarkConfigPath: path.resolve(
            import.meta.dirname,
            'remark-fixtures/native.remarkrc',
          ),
        },
      },
      settings: {
        'mdx/native-rules': ['heading-increment'],
      },
    },
  ],
  invalid: [],
})
