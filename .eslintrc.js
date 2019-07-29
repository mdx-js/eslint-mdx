module.exports = {
  root: true,
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  extends: [
    'plugin:jest/recommended',
    '1stg/react',
    'plugin:@rxts/mdx/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/array-type': [
      0,
      {
        default: 'array-simple',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/prop-types': 0,
      },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'import/order': 0,
        'import/no-unresolved': 0,
      },
    },
  ],
}
