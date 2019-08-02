import { last } from './helper'
import { isComment, COMMENT_CONTENT_REGEX } from './regexp'

import { Node, Point, Parent } from 'unist'

export interface Comment {
  fixed: string
  loc: {
    start: Point
    end: Point
  }
  origin: string
}

export const normalizeJsxNode = (node: Node, parent?: Parent) => {
  const value = node.value as string

  if (isComment(value) || !parent) {
    return node
  }

  const matched = value.match(COMMENT_CONTENT_REGEX)

  if (!matched) {
    return node
  }

  const comments: Comment[] = []
  const {
    position: {
      start: { line, column, offset: startOffset },
    },
  } = node

  return Object.assign(node, {
    data: {
      ...node.data,
      jsxType: 'JSXElementWithHTMLComments',
      comments,
      // jsx in paragraph is considered as plain html in mdx, what means html style comments are valid
      // TODO: in this case, jsx style comments could be a mistake
      inline: parent.type !== 'root',
    },
    value: value.replace(
      COMMENT_CONTENT_REGEX,
      (matched: string, $0: string, $1: string, $2: string, offset: number) => {
        const endOffset = offset + matched.length
        const startLines = value.slice(0, offset).split('\n')
        const endLines = value.slice(0, endOffset).split('\n')
        const fixed = `{/${'*'.repeat($0.length - 2)}${$1}${'*'.repeat(
          $2.length - 2,
        )}/}`
        const startLineOffset = startLines.length - 1
        const endLineOffset = endLines.length - 1
        comments.push({
          fixed,
          loc: {
            start: {
              line: line + startLineOffset,
              column:
                last(startLines).length + (startLineOffset ? 0 : column - 1),
              offset: startOffset + offset,
            },
            end: {
              line: line + endLineOffset - 1,
              column: last(endLines).length + (endLineOffset ? 0 : column - 1),
              offset: startOffset + endOffset,
            },
          },
          origin: matched,
        })
        return fixed
      },
    ),
  })
}
