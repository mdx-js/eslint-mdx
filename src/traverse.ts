import { last } from './helper'
import {
  isOpenTag,
  isCloseTag,
  isComment,
  isSelfClosingTag,
  isOpenCloseTag,
} from './regexp'
import { Traverser, TraverseOptions } from './types'

import { Node, Parent } from 'unist'

export class Traverse {
  private _enter: Traverser

  constructor({ enter }: TraverseOptions) {
    this._enter = enter
  }

  // fix #7
  combineJsxNodes(nodes: Node[]) {
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
                end: last(jsxNodes).position.end,
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

  traverse(node: Node, parent?: Parent) {
    if (!node) {
      return
    }

    const children = node.children as Node[]

    if (children) {
      ;(node.children = this.combineJsxNodes(children)).forEach(child =>
        this.traverse(child, node as Parent),
      )
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
