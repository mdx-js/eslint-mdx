/* istanbul ignore file */

import { noJsxHtmlComments } from './no-jsx-html-comments'
import { noUnescapedEntities } from './no-unescaped-entities'
import { noUnusedExpressions } from './no-unused-expressions'
import { remark } from './remark'

export * from './helpers'
export * from './types'

export { noJsxHtmlComments, noUnescapedEntities, noUnusedExpressions, remark }

export const rules = {
  'no-jsx-html-comments': noJsxHtmlComments,
  'no-unescaped-entities': noUnescapedEntities,
  'no-unused-expressions': noUnusedExpressions,
  noJsxHtmlComments,
  noUnescapedEntities,
  noUnusedExpressions,
  remark,
}
