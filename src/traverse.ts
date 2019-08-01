import { combineJsxNodes } from './helper'

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

  traverse(node: Node, parent?: Parent) {
    if (!node) {
      return
    }

    const children = node.children as Node[]

    if (children) {
      ;(node.children = combineJsxNodes(children)).forEach(child =>
        this.traverse(child, node as Parent),
      )
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
