import type { JSXElement, JSXFragment } from '@babel/types'
import type { AST, Linter } from 'eslint'
import type { Attacher } from 'unified'
import type { Node as _Node, Parent as _Parent, Point } from 'unist'

export interface Node<T = string> extends _Node {
  value?: T
}

export interface Parent<T = string> extends _Parent {
  children: Array<Node<T>>
}

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

export type JsxNode = { range: [number, number] } & (JSXElement | JSXFragment)

export type ParserFn = (
  code: string,
  options: Linter.ParserOptions,
) => AST.Program | Linter.ESLintParseResult

export type ParserConfig =
  | {
      parse: ParserFn
    }
  | {
      parseForESLint: ParserFn
    }

export interface LocationError {
  column: number
  index?: number
  pos?: number
  lineNumber: number
}

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string[] | string
  markdownExtensions?: string[] | string
  filePath?: string
  parser?: ParserConfig | ParserFn | string
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

export type RemarkPlugin = Attacher | string

export interface RemarkConfig {
  settings: Record<string, string>
  plugins: Array<RemarkPlugin | [RemarkPlugin, ...unknown[]]>
}
