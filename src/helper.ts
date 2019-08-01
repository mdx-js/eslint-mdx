import {
  isOpenTag,
  isCloseTag,
  isComment,
  isSelfClosingTag,
  isOpenCloseTag,
} from './regexp'

import { Node, Position } from 'unist'
import { AST } from 'eslint'
// SourceLocation` is not exported from estree, but it is actually working
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

// fix #7
export const combineJsxNodes = (nodes: Node[]) => {
  let offset = 0
  const jsxNodes: Node[] = []
  const { length } = nodes
  return nodes.reduce<Node[]>((acc, node, index) => {
    if (node.type === 'jsx') {
      const rawText = node.value as string
      if (isOpenTag(rawText as string)) {
        offset++
        jsxNodes.push(node)
      } else {
        if (isCloseTag(rawText)) {
          offset--
        } else if (
          !isComment(rawText) &&
          !isSelfClosingTag(rawText) &&
          !isOpenCloseTag(rawText)
        ) {
          const { start } = node.position
          throw Object.assign(
            new SyntaxError(
              `'Unknown node type: ${JSON.stringify(
                node.type,
              )}, text: ${JSON.stringify(rawText)}`,
            ),
            {
              lineNumber: start.line,
              column: start.column,
              index: start.offset,
            },
          )
        }

        jsxNodes.push(node)

        if (!offset || index === length - 1) {
          acc.push({
            type: 'jsx',
            value: jsxNodes.reduce((acc, { value }) => (acc += value), ''),
            position: {
              start: jsxNodes[0].position.start,
              end: jsxNodes[jsxNodes.length - 1].position.end,
            },
          })
          jsxNodes.length = 0
        }
      }
    } else if (offset) {
      jsxNodes.push(node)
    } else {
      acc.push(node)
    }
    return acc
  }, [])
}
