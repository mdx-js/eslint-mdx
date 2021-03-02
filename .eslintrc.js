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
    // `strictNullChecks` is required
    '@typescript-eslint/no-unnecessary-condition': 0,
  },
}
