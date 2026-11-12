export default {
  plugins: [
    [
      'remark-lint-no-undefined-references',
      {
        allow: [/^b$/iu],
      },
    ],
  ],
}
