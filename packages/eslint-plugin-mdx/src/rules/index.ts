/* istanbul ignore file */
import { noUnusedExpressions } from './no-unused-expressions.js'
import { remark } from './remark.js'

export type * from './types.js'

export { noUnusedExpressions, remark }

export const rules = {
  'no-unused-expressions': noUnusedExpressions,
  remark,
}
