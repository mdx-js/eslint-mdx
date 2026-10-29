import type { PackageJson } from 'eslint-mdx'

import { cjsRequire } from './helpers.js'

const pkg = cjsRequire<PackageJson>('../package.json')

export const meta = { name: pkg.name, version: pkg.version }
