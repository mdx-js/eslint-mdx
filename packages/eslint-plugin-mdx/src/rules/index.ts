import { codeBlock } from './code-block'
import { noJsxHtmlComments } from './no-jsx-html-comments'
import { noUnescapedEntities } from './no-unescaped-entities'
import { noUnusedExpressions } from './no-unused-expressions'
import { remark } from './remark'

export * from './helper'
export * from './types'

export {
  codeBlock,
  noJsxHtmlComments,
  noUnescapedEntities,
  noUnusedExpressions,
  remark,
}

export const rules = {
  'code-block': codeBlock,
  'no-jsx-html-comments': noJsxHtmlComments,
  'no-unescaped-entities': noUnescapedEntities,
  'no-unused-expressions': noUnusedExpressions,
  remark,
}
