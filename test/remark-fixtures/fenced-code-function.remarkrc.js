export default {
  plugins: [
    [
      'remark-lint-fenced-code-flag',
      value => (value === 'js' ? undefined : 'custom fenced flag'),
    ],
  ],
}
