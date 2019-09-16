require('ts-node').register({
  transpileOnly: true,
})

module.exports = {
  root: true,
  extends: ['@1stg/eslint-config/recommended'],
  overrides: [
    {
      files: '*.ts',
      settings: {
        node: {
          allowModules: ['@babel/types', 'estree', 'unist'],
        },
      },
      rules: {
        '@typescript-eslint/unbound-method': 0, // See https://github.com/typescript-eslint/typescript-eslint/issues/636
      },
    },
  ],
}
