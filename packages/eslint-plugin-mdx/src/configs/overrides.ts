import type { Linter } from 'eslint'

import { base } from './base'

export const overrides: Linter.Config = {
  ...base,
  globals: {
    React: 'readonly',
  },
  rules: {
    'lines-between-class-members': 0, // See https://github.com/mdx-js/mdx/issues/195
    'react/jsx-no-undef': [
      2,
      {
        allowGlobals: true,
      },
    ],
    'react/react-in-jsx-scope': 0,
  },
}
