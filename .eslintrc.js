require('ts-node').register({
  transpileOnly: true,
})

module.exports = {
  root: true,
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  extends: ['plugin:jest/recommended', '1stg/react'],
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
      files: ['*.d.ts'],
      rules: {
        'import/order': 0,
        'import/no-duplicates': 0,
        'import/no-unresolved': 0,
      },
    },
    {
      files: ['*.mdx'],
      extends: ['plugin:@rxts/mdx/recommended'],
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'react/prop-types': 0,
      },
    },
  ],
}
