module.exports = {
  root: true,
  extends: ['@1stg'],
  rules: {
    // `strictNullChecks` is required
    '@typescript-eslint/no-unnecessary-condition': 0,
  },
  overrides: [
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/consistent-type-imports': 2,
      },
    },
    {
      files: '*.{md,mdx}',
      rules: {
        'react/no-unescaped-entities': 1,
      },
      settings: {
        'mdx/code-blocks': true,
      },
    },
  ],
}
