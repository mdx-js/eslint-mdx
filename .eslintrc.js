module.exports = {
  root: true,
  extends: ['@1stg'],
  rules: {
    // `strictNullChecks` is required
    '@typescript-eslint/no-unnecessary-condition': 'off',
    'unicorn/prefer-export-from': [
      'error',
      {
        ignoreUsedVariables: true,
      },
    ],
  },
  overrides: [
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
    {
      files: '*.{md,mdx}',
      rules: {
        'react/no-unescaped-entities': 'warn',
      },
      settings: {
        'mdx/code-blocks': true,
      },
    },
  ],
}
