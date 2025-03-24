import { cjsRequire } from './helpers.js'
import type { PackageJson } from './types.js'

const pkg = cjsRequire<PackageJson>('../package.json')

export const meta = { name: pkg.name, version: pkg.version }
