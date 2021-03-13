const tsNode = require('ts-node')

tsNode.register()

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
    // TODO: move to `@1sg/eslint-config` instead
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/consistent-type-imports': 2,
        '@typescript-eslint/no-type-alias': [
          2,
          {
            allowAliases: 'in-unions-and-intersections',
            allowCallbacks: 'always',
            allowConditionalTypes: 'always',
            allowConstructors: 'always',
            allowLiterals: 'in-unions-and-intersections',
            allowMappedTypes: 'always',
            allowTupleTypes: 'always',
          },
        ],
      },
    },
    {
      files: '**/*.{md,mdx}/**',
      rules: {
        'prettier/prettier': 0,
        'unicorn/filename-case': 0,
      },
    },
    {
      files: '*.{md,mdx}',
      // related to https://github.com/eslint/eslint/issues/14207
      rules: {
        'prettier/prettier': 0,
        'unicorn/filename-case': 0,
        'remark-lint-no-duplicate-headings': 0,
      },
      settings: {
        'mdx/code-blocks': true,
      },
    },
  ],
}
