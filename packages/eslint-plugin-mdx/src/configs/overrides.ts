export const overrides = {
  globals: {
    React: false,
  },
  rules: {
    'lines-between-class-members': 0, // See https://github.com/mdx-js/mdx/issues/195
    'react/react-in-jsx-scope': 0,
  },
}
