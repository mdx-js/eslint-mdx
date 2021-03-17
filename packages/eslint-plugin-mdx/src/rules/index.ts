/* istanbul ignore file */

import { noJsxHtmlComments } from './no-jsx-html-comments'
import { noUnusedExpressions } from './no-unused-expressions'
import { remark } from './remark'

export * from './helpers'
export * from './types'

export { noJsxHtmlComments, noUnusedExpressions, remark }

export const rules = {
  'no-jsx-html-comments': noJsxHtmlComments,
  'no-unused-expressions': noUnusedExpressions,
  noJsxHtmlComments,
  noUnusedExpressions,
  remark,
}
