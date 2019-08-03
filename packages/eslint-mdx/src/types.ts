import { Node, Parent, Point } from 'unist'

export type Traverser = (node: Node, parent?: Parent) => void

export interface TraverseOptions {
  enter: Traverser
}

export interface Comment {
  fixed: string
  loc: {
    start: Point
    end: Point
  }
  origin: string
}
