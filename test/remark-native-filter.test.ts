import path from 'node:path'

import { languageOptions, ruleTester } from './helpers.js'

import { remark } from 'eslint-plugin-mdx'

const filename = 'native-filter.mdx'
const configOptions = {
  ...languageOptions,
  parserOptions: {
    ...languageOptions.parserOptions,
    remarkConfigPath: path.resolve(
      import.meta.dirname,
      'remark-fixtures/native.remarkrc',
    ),
  },
}

ruleTester.run('remark native option', remark, {
  valid: [
    {
      code: '# A\n\n### B',
      filename,
      languageOptions: configOptions,
      options: [{ native: true }],
    },
  ],
  invalid: [
    {
      code: '# A\n\n### B',
      filename,
      languageOptions: configOptions,
      errors: [
        {
          message: JSON.stringify({
            reason: 'Unexpected heading rank `3`, exected rank `2`',
            source: 'remark-lint',
            ruleId: 'heading-increment',
            severity: 1,
          }),
          line: 3,
          column: 1,
        },
      ],
      output: '# A\n\n### B\n',
    },
  ],
})
