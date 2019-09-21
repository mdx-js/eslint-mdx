import * as rebass from 'rebass'

import { base } from './base'
import { getGlobals } from './helper'

export const overrides = {
  ...base,
  globals: getGlobals(rebass, {
    React: false,
  }),
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
