import {
  isOpenTag,
  isCloseTag,
  isVoidTag,
  isComment,
  isOpenCloseTag,
} from './utils'

import { Node, Parent } from 'unist'

export type Traverser = (node: Node, parent?: Parent) => void

export interface TraverseOptions {
  enter: Traverser
}

export class Traverse {
  private _enter: Traverser

  constructor({ enter }: TraverseOptions) {
    this._enter = enter
  }

  combineJsxNodes(jsxNodes: Node[]): Node {
    return {
      type: 'jsx',
      value: jsxNodes.reduce((acc, { value }) => (acc += value), ''),
      position: {
        start: jsxNodes[0].position.start,
        end: jsxNodes[jsxNodes.length - 1].position.end,
      },
    }
  }

  // fix #7
  combineInlineJsx(nodes: Node[]) {
    let offset = 0
    const jsxNodes: Node[] = []
    const { length } = nodes
    return nodes.reduce((acc, node, index) => {
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
            !isVoidTag(rawText) &&
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
            acc.push(this.combineJsxNodes(jsxNodes))
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

    this._enter(node, parent)

    if (node.children) {
      parent = node as Parent
      this.combineInlineJsx(parent.children).forEach(child =>
        this.traverse(child, parent),
      )
    }
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
