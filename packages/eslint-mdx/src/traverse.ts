import type { Node, Parent } from 'unist'

import { last } from './helpers'
import { parser } from './parser'
import {
  isCloseTag,
  isComment,
  isOpenCloseTag,
  isOpenTag,
  isSelfClosingTag,
} from './regexp'
import type { TraverseOptions, Traverser } from './types'

export class Traverse {
  code: string

  // @internal
  private readonly _enter: Traverser

  constructor({ code, enter }: TraverseOptions) {
    this.code = code
    this._enter = enter
  }

  combineLeftJsxNodes(jsxNodes: Node[], parent?: Parent): Node {
    const start = jsxNodes[0].position.start
    const end = { ...last(jsxNodes).position.end }
    // fix #279
    if (parent && parent.position.indent?.length > 0) {
      end.offset += parent.position.indent.reduce(
        (acc, indent, index) => acc + (index ? indent + 1 : 0),
        0,
      )
    }
    return {
      type: 'jsx',
      data: jsxNodes[0].data,
      value: this.code.slice(start.offset, end.offset),
      position: {
        start,
        end,
      },
    }
  }

  // fix #7
  combineJsxNodes(nodes: Node[], parent?: Parent) {
    let offset = 0
    let hasOpenTag = false
    const jsxNodes: Node[] = []
    const { length } = nodes
    // eslint-disable-next-line sonarjs/cognitive-complexity
    return nodes.reduce<Node[]>((acc, node, index) => {
      if (node.type === 'jsx') {
        const value = node.value as string
        if (isOpenTag(value)) {
          offset++
          hasOpenTag = true
          jsxNodes.push(node)
        } else {
          if (isCloseTag(value)) {
            offset--
            jsxNodes.push(node)
          } else if (
            isComment(value) ||
            isSelfClosingTag(value) ||
            isOpenCloseTag(value)
          ) {
            jsxNodes.push(node)
          } else {
            // #272, we consider the first jsx node as open tag although it's not precise
            if (!index) {
              offset++
              hasOpenTag = true
            }
            try {
              // fix #138
              const nodes = parser.normalizeJsxNode(node, parent)
              jsxNodes.push(...(Array.isArray(nodes) ? nodes : [nodes]))
            } catch {
              // #272 related
              /* istanbul ignore else */
              if (offset) {
                jsxNodes.push(node)
              } else {
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
            }
          }

          if (!offset) {
            // fix #158
            const firstOpenTagIndex = jsxNodes.findIndex(
              node => typeof node.value === 'string' && isOpenTag(node.value),
            )
            if (firstOpenTagIndex === -1) {
              if (hasOpenTag) {
                acc.push(this.combineLeftJsxNodes(jsxNodes, parent))
              } else {
                acc.push(...jsxNodes)
              }
            } else {
              acc.push(
                ...jsxNodes.slice(0, firstOpenTagIndex),
                this.combineLeftJsxNodes(
                  jsxNodes.slice(firstOpenTagIndex),
                  parent,
                ),
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
        acc.push(this.combineLeftJsxNodes(jsxNodes, parent))
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
      for (const child of children) {
        this.traverse(child, parent)
      }
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
