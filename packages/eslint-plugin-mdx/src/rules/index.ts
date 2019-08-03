import { noJsxHtmlComments } from './no-jsx-html-comments'
import { noUnEscapedEntities } from './no-unescaped-entities'
import { noUnUsedExpressions } from './no-unused-expressions'

export * from './helper'
export * from './types'

export { noJsxHtmlComments, noUnEscapedEntities, noUnUsedExpressions }

export const rules = {
  'no-jsx-html-comments': noJsxHtmlComments,
  'no-unescaped-entities': noUnEscapedEntities,
  'no-unused-expressions': noUnUsedExpressions,
}
