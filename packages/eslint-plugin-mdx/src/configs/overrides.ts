import type { Linter } from 'eslint'
import { arrayify } from 'eslint-mdx'

import { base } from './base'

let isReactPluginAvailable = false

try {
  require.resolve('eslint-plugin-react')
  isReactPluginAvailable = true
} catch {}

export const overrides: Linter.Config = {
  ...base,
  globals: {
    React: false,
  },
  plugins: arrayify<string[] | string | null>(
    base.plugins,
    /* istanbul ignore next */
    isReactPluginAvailable ? 'react' : null,
  ),
  rules: {
    'lines-between-class-members': 0, // See https://github.com/mdx-js/mdx/issues/195
    'react/jsx-no-undef':
      /* istanbul ignore next */
      isReactPluginAvailable
        ? [
            2,
            {
              allowGlobals: true,
            },
          ]
        : 0,
    'react/react-in-jsx-scope': 0,
  },
}
