import { isComment, COMMENT_CONTENT_REGEX } from './regexp'
import { mdxProcessor } from './parser'

import { Node, Parent } from 'unist'

export const normalizeJsxNode = (node: Node) => {
  const rawText = node.value as string
  if (!isComment(rawText)) {
    const matched = rawText.match(COMMENT_CONTENT_REGEX)
    if (matched) {
      node.value = rawText.replace(
        COMMENT_CONTENT_REGEX,
        (_matched, $0) => `{/*${$0}*/}`,
      )
    }
  }
  return node
}

export const normalizeMdx = (source: string) => {
  const lines = source.split('\n').length
  const { children } = mdxProcessor.parse(source) as Parent
  let lastLine: number
  return children.reduce((result, node, index) => {
    const {
      position: { start, end },
    } = node
    const startLine = start.line
    const endLine = end.line
    if (lastLine != null && lastLine !== startLine) {
      result += '\n'.repeat(startLine - lastLine)
    }
    if (node.type === 'jsx') {
      result += normalizeJsxNode(node).value
    } else {
      result += source.slice(start.offset, end.offset)
    }

    if (index === children.length - 1 && endLine < lines) {
      result += '\n'.repeat(lines - endLine)
    }

    lastLine = endLine
    return result
  }, '')
}
