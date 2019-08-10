import { noJsxHtmlComments } from './no-jsx-html-comments'
import { noUnescapedEntities } from './no-unescaped-entities'
import { noUnusedExpressions } from './no-unused-expressions'

export * from './types'

export { noJsxHtmlComments, noUnescapedEntities, noUnusedExpressions }

export const rules = {
  'no-jsx-html-comments': noJsxHtmlComments,
  'no-unescaped-entities': noUnescapedEntities,
  'no-unused-expressions': noUnusedExpressions,
}
