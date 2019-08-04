import { Linter } from 'eslint'
import { Node, Parent, Point } from 'unist'

export type Arrayable<T> = T[] | readonly T[]

export interface LocationError {
  column?: number
  index?: number
  lineNumber?: number
}

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
