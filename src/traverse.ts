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

    this._enter(node, parent)

    if (node.children) {
      /**
       * FIXME: inline jsx:
       *
       * {
          type: 'jsx',
          value: '<b>',
          position: Position { start: [Object], end: [Object], indent: [] }
        },
        {
          type: 'text',
          value: 'velit',
          position: Position { start: [Object], end: [Object], indent: [] }
        },
        {
          type: 'jsx',
          value: '</b>',
          position: Position { start: [Object], end: [Object], indent: [] }
        }
       */
      console.log(node.children)
      parent = node as Parent
      parent.children.forEach(child => this.traverse(child, parent))
    }
  }
}

export const traverse = (root: Parent, options: TraverseOptions) =>
  new Traverse(options).traverse(root)
