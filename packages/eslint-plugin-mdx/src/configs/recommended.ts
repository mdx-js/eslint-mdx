import { base } from './base'

export const recommended = {
  ...base,
  rules: {
    'mdx/no-jsx-html-comments': 2,
    'mdx/no-unescaped-entities': 1,
    'mdx/no-unused-expressions': 2,
    'mdx/remark': 1,
    'no-unused-expressions': 0,
    'react/no-unescaped-entities': 0,
  },
}
