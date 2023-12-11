import type { Position } from 'acorn'
import type { AST, Linter } from 'eslint'
import type { BaseNode, Program } from 'estree'
import type { JSXElement } from 'estree-jsx'
import type { Root } from 'mdast'
import type { VFileOptions } from 'vfile'
import type { VFileMessage } from 'vfile-message'

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string[] | string
  markdownExtensions?: string[] | string
  filePath?: string
  ignoreRemarkConfig?: boolean
}

export interface NormalPosition {
  start: number
  end: number
  loc: {
    start: Position
    end: Position
  }
  range: [number, number]
}

export interface WorkerOptions {
  fileOptions: VFileOptions
  physicalFilename: string
  isMdx: boolean
  process?: boolean
  ignoreRemarkConfig?: boolean
}

export interface WorkerParseResult {
  root: Root
  body: Program['body']
  comments: Program['comments']
  tokens: AST.Token[]
}

export interface WorkerProcessResult {
  messages: VFileMessage[]
  content: string
}

export type WorkerResult = WorkerParseResult | WorkerProcessResult

type _Arrayable<T, R = T extends Array<infer U> ? U : T> = R | R[]

export type Arrayable<T> = _Arrayable<T>

export interface MDXCode extends BaseNode {
  type: 'MDXCode'
  value: string
  lang?: string | null
  meta?: string | null
}

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6

export interface MDXHeading extends BaseNode {
  type: 'MDXHeading'
  depth: HeadingDepth
  children: JSXElement['children']
}
