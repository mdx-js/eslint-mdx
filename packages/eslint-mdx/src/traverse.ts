import { last } from './helper'
import {
  isCloseTag,
  isComment,
  isOpenCloseTag,
  isOpenTag,
  isSelfClosingTag,
} from './regexp'
import { Node, Parent, TraverseOptions, Traverser } from './types'

export class Traverse {
  // @internal
  private readonly _enter: Traverser

  constructor({ enter }: TraverseOptions) {
    this._enter = enter
  }

  combineLeftJsxNodes(jsxNodes: Node[]) {
    return {
      type: 'jsx',
      data: jsxNodes[0].data,
      value: jsxNodes.reduce((acc, { value }) => (acc += value), ''),
      position: {
        start: jsxNodes[0].position.start,
        end: last(jsxNodes).position.end,
      },
    }
  }

  // fix #7
  combineJsxNodes(nodes: Node[]) {
    let offset = 0
    const jsxNodes: Node[] = []
    const { length } = nodes
    // eslint-disable-next-line sonarjs/cognitive-complexity
    return nodes.reduce<Node[]>((acc, node, index) => {
      if (node.type === 'jsx') {
        const value = node.value as string
        if (isOpenTag(value)) {
          offset++
          jsxNodes.push(node)
        } else {
          if (isCloseTag(value)) {
            offset--
          }
          // prettier-ignore
          /* istanbul ignore next */
          else if (
            !isComment(value) &&
            !isSelfClosingTag(value) &&
            !isOpenCloseTag(value)
          ) {
            // should never happen, just for robustness
            const { start } = node.position
            throw Object.assign(
              new SyntaxError('unknown jsx node: ' + JSON.stringify(value)),
              {
                lineNumber: start.line,
                column: start.column,
                index: start.offset,
              },
            )
          }

          jsxNodes.push(node)

          if (!offset) {
            acc.push(this.combineLeftJsxNodes(jsxNodes))
            jsxNodes.length = 0
          }
        }
      } else if (offset) {
        jsxNodes.push(node)
      } else {
        acc.push(node)
      }
      if (index === length - 1 && jsxNodes.length > 0) {
        acc.push(this.combineLeftJsxNodes(jsxNodes))
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
      children = node.children = this.combineJsxNodes(children)
      children.forEach(child => this.traverse(child, node as Parent))
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
