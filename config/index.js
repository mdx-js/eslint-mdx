// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')

require('ts-node').register({
  project: path.resolve('src/tsconfig.json'),
  transpileOnly: true,
})

module.exports = require(path.resolve('src'))
