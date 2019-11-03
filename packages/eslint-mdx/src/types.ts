/* eslint-disable @typescript-eslint/no-type-alias */
import { AST, Linter } from 'eslint'

export type JSXElement = import('@babel/types').JSXElement
export type JSXFragment = import('@babel/types').JSXFragment
export type Node = import('unist').Node
export type Parent = import('unist').Parent
export type Point = import('unist').Point

export type JsxNode = (JSXElement | JSXFragment) & { range: [number, number] }

export type JsxTypes = Readonly<[JSXElement['type'], JSXFragment['type']]>

export type JsxType = JsxTypes[number]

export type Arrayable<T> = T[] | readonly T[]

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
  column?: number
  index?: number
  lineNumber?: number
}

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string | string[]
  markdownExtensions?: string | string[]
  filePath?: string
  parser?: string | ParserConfig | ParserFn
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
