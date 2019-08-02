import { isComment, COMMENT_CONTENT_REGEX } from './regexp'

import { Node } from 'unist'

export const normalizeJsxNode = (node: Node) => {
  let rawText = node.value as string

  if (isComment(rawText)) {
    return node
  }

  const matched = rawText.match(COMMENT_CONTENT_REGEX)

  if (!matched) {
    return node
  }

  node.jsxType = 'JSXElementWithHTMLComments'
  node.raw = rawText
  rawText = node.value = rawText.replace(
    COMMENT_CONTENT_REGEX,
    (_matched, $0, $1, $2) =>
      `{/${'*'.repeat($0.length - 1)}${$1}${'*'.repeat($2.length - 1)}/}`,
  )

  return node
}
