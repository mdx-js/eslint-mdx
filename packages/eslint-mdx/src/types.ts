import { JSXElement, JSXFragment } from '@babel/types'
import { AST, Linter } from 'eslint'
import { Node, Parent, Point } from 'unist'

export type JsxNode = (JSXElement | JSXFragment) & { range: [number, number] }

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type JsxTypes = Readonly<[JSXElement['type'], JSXFragment['type']]>

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type JsxType = JsxTypes[number]

// eslint-disable-next-line @typescript-eslint/no-type-alias
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
