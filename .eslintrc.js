module.exports = {
  root: true,
  extends: ['@1stg'],
  rules: {
    // `strictNullChecks` is required
    '@typescript-eslint/no-unnecessary-condition': 0,
  },
  settings: {
    node: {
      allowModules: ['@babel/types', 'estree', 'unist'],
    },
  },
  overrides: [
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/consistent-type-imports': 2,
      },
    },
    {
      files: '**/*.{md,mdx}/**',
      rules: {
        'unicorn/filename-case': 0,
      },
    },
    {
      files: '*.{md,mdx}',
      rules: {
        'react/no-unescaped-entities': 1,
        // related to https://github.com/eslint/eslint/issues/14207
        'unicorn/filename-case': 0,
      },
      settings: {
        'mdx/code-blocks': true,
      },
    },
  ],
}
