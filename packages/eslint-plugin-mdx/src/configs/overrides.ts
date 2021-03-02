import { base } from './base'
import { getGlobals } from './helper'

let rebass: typeof import('rebass') | string[]

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  rebass = require('rebass') as typeof rebass
} catch {
  // `rebass`(or `reflexbox` actually) requires `react` as peerDependency, but not all projects using `mdx` are `React` based, so we fallback to hardcoded `rebass` Components here
  /* istanbul ignore next */
  rebass = ['Box', 'Flex', 'Text', 'Heading', 'Link', 'Button', 'Image', 'Card']
}

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
