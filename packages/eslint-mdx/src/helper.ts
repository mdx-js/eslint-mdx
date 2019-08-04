import { isComment, COMMENT_CONTENT_REGEX } from './regexp'
import { Comment, Arrayable } from './types'

import { Position, Node, Parent } from 'unist'
import { AST } from 'eslint'
// `SourceLocation` is not exported from estree, but it is actually working
// eslint-disable-next-line import/named
import { SourceLocation } from 'estree'

export const normalizePosition = (position: Position) => {
  const start = position.start.offset
  const end = position.end.offset
  return {
    range: [start, end] as AST.Range,
    loc: {
      ...position,
    },
    start,
    end,
  }
}

export interface BaseNode {
  type: string
  loc?: SourceLocation
  range?: [number, number]
}

export function restoreNodeLocation<T extends BaseNode>(
  node: T,
  startLine: number,
  offset = 0,
): T {
  if (!node || !node.loc || !node.range) {
    return node
  }

  Object.entries(node).forEach(([key, value]) => {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      node[key as keyof T] = value.map(child =>
        restoreNodeLocation(child, startLine, offset),
      ) as any
    } else {
      node[key as keyof T] = restoreNodeLocation(
        value,
        startLine,
        offset,
      ) as T[keyof T]
    }
  })

  const {
    loc: { start: startLoc, end: endLoc },
    range,
  } = node
  const start = range[0] + offset
  const end = range[1] + offset
  return {
    ...node,
    start,
    end,
    range: [start, end],
    loc: {
      start: {
        line: startLine + startLoc.line,
        column: startLoc.column,
      },
      end: {
        line: startLine + endLoc.line,
        column: endLoc.column,
      },
    },
  }
}

export const first = <T>(items: T[] | ReadonlyArray<T>) => items && items[0]

export const last = <T>(items: T[] | ReadonlyArray<T>) =>
  items && items[items.length - 1]

export const normalizeJsxNode = (node: Node, parent?: Parent) => {
  const value = node.value as string

  if (isComment(value)) {
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
      inline: !!parent && parent.type !== 'root',
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

export const hasProperties = <T, P extends keyof T = keyof T>(
  obj: {},
  properties: Arrayable<P>,
): obj is T => properties.every(property => property in obj)
