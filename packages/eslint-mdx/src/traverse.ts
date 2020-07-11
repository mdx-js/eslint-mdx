import { last } from './helper'
import { parser } from './parser'
import {
  isCloseTag,
  isComment,
  isOpenCloseTag,
  isOpenTag,
  isSelfClosingTag,
} from './regexp'
import { Node, Parent, TraverseOptions, Traverser } from './types'

export class Traverse {
  code: string

  // @internal
  private readonly _enter: Traverser

  constructor({ code, enter }: TraverseOptions) {
    this.code = code
    this._enter = enter
  }

  combineLeftJsxNodes(jsxNodes: Node[]) {
    const start = jsxNodes[0].position.start
    const end = last(jsxNodes).position.end
    return {
      type: 'jsx',
      data: jsxNodes[0].data,
      value: this.code.slice(start.offset, end.offset),
      position: {
        start: jsxNodes[0].position.start,
        end: last(jsxNodes).position.end,
      },
    }
  }

  // fix #7
  combineJsxNodes(nodes: Node[], parent?: Parent) {
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
          if (
            isCloseTag(value)
          ) {
            offset--
            jsxNodes.push(node)
          }
          // prettier-ignore
          /* istanbul ignore next */
          else if (
            !isComment(value) &&
            !isSelfClosingTag(value) &&
            !isOpenCloseTag(value)
          ) {
            try {
              // fix #138
              const nodes = parser.normalizeJsxNode(node, parent)
              jsxNodes.push(...(Array.isArray(nodes) ? nodes : [nodes]))
            } catch {
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
          } else {
            jsxNodes.push(node)
          }

          if (!offset) {
            // fix #158
            const firstOpenTagIndex = jsxNodes.findIndex(node =>
              isOpenTag(node.value as string),
            )
            if (firstOpenTagIndex === -1) {
              acc.push(...jsxNodes)
            } else {
              acc.push(...jsxNodes.slice(0, firstOpenTagIndex))
              acc.push(
                this.combineLeftJsxNodes(jsxNodes.slice(firstOpenTagIndex)),
              )
            }
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
      const parent = node as Parent
      children = node.children = this.combineJsxNodes(children, parent)
      children.forEach(child => this.traverse(child, parent))
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
