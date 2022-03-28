/**
 * workaround for @link https://github.com/benmosher/eslint-plugin-import/issues/2002
 */

import { remark } from './remark'

export * from './helpers'
export * from './options'
export * from './types'

export const processors = { remark }
