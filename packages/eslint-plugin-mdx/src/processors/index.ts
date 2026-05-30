import type { Linter } from 'eslint'

import { remark } from './remark.js'

export * from './helpers.js'
export * from './options.js'
export { createRemarkProcessor } from './remark.js'
export type * from './types.js'

export const processors: { remark: Linter.Processor } = { remark }
