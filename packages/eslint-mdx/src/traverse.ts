import type { Node, Parent } from 'unist'

import type { Traverser } from './types'

export class Traverse {
  constructor(
    // @internal
    private readonly _enter: Traverser,
  ) {}

  traverse(node: Node, parent?: Parent) {
    /* istanbul ignore if */
    if (!node) {
      // should never happen, just for robustness
      return
    }

    const children = (node as Parent).children

    if (children) {
      const parent = node as Parent
      for (const child of children) {
        this.traverse(child, parent)
      }
    }

    this._enter(node, parent)
  }
}

export const traverse = (root: Parent, enter: Traverser) =>
  new Traverse(enter).traverse(root)
