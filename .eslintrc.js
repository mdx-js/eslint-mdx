const tsNode = require('ts-node')

tsNode.register({
  compilerOptions: {
    module: 'commonjs',
    pretty: true,
  },
  transpileOnly: true,
})

module.exports = {
  root: true,
  extends: ['@1stg'],
  rules: {
    '@typescript-eslint/no-unnecessary-condition': 0,
    '@typescript-eslint/unbound-method': 0, // See https://github.com/typescript-eslint/typescript-eslint/issues/636
  },
}
