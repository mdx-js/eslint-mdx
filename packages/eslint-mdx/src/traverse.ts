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

export const SKIP_COMBINE_JSX_TYPES: readonly string[] = ['root', 'jsx']

export class Traverse {
  private readonly _enter: Traverser

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
        if (isOpenTag(rawText)) {
          offset++
          jsxNodes.push(node)
        } else {
          if (isCloseTag(rawText)) {
            offset--
          }
          // prettier-ignore
          /* istanbul ignore next */
          else if (
            !isComment(rawText) &&
            !isSelfClosingTag(rawText) &&
            !isOpenCloseTag(rawText)
          ) {
            // should never happen, just for robustness
            const { start } = node.position
            throw Object.assign(
              new SyntaxError('unknown jsx node: ' + JSON.stringify(rawText)),
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
              data: jsxNodes[0].data,
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
    /* istanbul ignore if */
    if (!node) {
      // should never happen, just for robustness
      return
    }

    let children = node.children as Node[]

    if (children) {
      if (!SKIP_COMBINE_JSX_TYPES.includes(node.type)) {
        children = node.children = this.combineJsxNodes(children)
      }
      children.forEach(child => this.traverse(child, node as Parent))
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
