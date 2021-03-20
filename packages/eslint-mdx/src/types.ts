import type { JSXElement, JSXFragment } from '@babel/types'
import type { AST, Linter } from 'eslint'
import type { Node, Parent, Point } from 'unist'

export type Arrayable<T> = T[] | readonly T[]

export declare type ValueOf<T> = T extends {
  [key: string]: infer M
}
  ? M
  : T extends {
      [key: number]: infer N
    }
  ? N
  : never

export type JsxNode = (JSXElement | JSXFragment) & { range: [number, number] }

export type ParserFn = (
  code: string,
  options: Linter.ParserOptions,
) => AST.Program | Linter.ESLintParseResult

export type ParserConfig =
  | {
      parseForESLint: ParserFn
    }
  | {
      parse: ParserFn
    }

export interface LocationError {
  column: number
  index?: number
  pos?: number
  lineNumber: number
}

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string | string[]
  markdownExtensions?: string | string[]
  filePath?: string
  parser?: string | ParserConfig | ParserFn
}

export type Traverser = (node: Node, parent?: Parent) => void

export interface TraverseOptions {
  code: string
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

export interface ParserServices {
  JSXElementsWithHTMLComments: Node[]
}
