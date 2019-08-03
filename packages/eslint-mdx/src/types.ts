import { Linter } from 'eslint'
import { Node, Parent, Point } from 'unist'

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string | string[]
}

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
