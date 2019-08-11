import { base } from './base'

import * as rebass from 'rebass'

export const overrides = {
  ...base,
  globals: Object.keys(rebass).reduce<Record<string, false>>(
    (globals, Component) =>
      Object.assign(globals, {
        [Component]: false,
      }),
    {
      React: false,
    },
  ),
  rules: {
    'lines-between-class-members': 0, // See https://github.com/mdx-js/mdx/issues/195
    'react/react-in-jsx-scope': 0,
  },
}
