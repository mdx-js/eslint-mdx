import type { Position } from 'acorn'
import type { AST, Linter } from 'eslint'
import type { Program } from 'estree'
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
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

export type RemarkPlugin = Plugin | string

export interface RemarkConfig {
  settings: Record<string, string>
  plugins: Array<RemarkPlugin | [RemarkPlugin, ...unknown[]]>
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
