const { overrides } = require('eslint-config-1stg/overrides')

require('ts-node').register({
  transpileOnly: true,
})

module.exports = {
  root: true,
  extends: ['1stg'],
  overrides: [
    ...overrides,
    {
      files: '*.ts',
      rules: {
        '@typescript-eslint/unbound-method': 0, // See https://github.com/typescript-eslint/typescript-eslint/issues/636
      },
    },
  ],
}
