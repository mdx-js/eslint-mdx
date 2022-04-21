import type { AST, Linter } from 'eslint'
import type { Program } from 'estree'
import type { Plugin } from 'unified'
import type { Node, Parent } from 'unist'
import type { VFileOptions } from 'vfile'
import type { VFileMessage } from 'vfile-message'

import type { MdxNodeType } from './helpers'

export declare type ValueOf<T> = T extends {
  [key: string]: infer M
}
  ? M
  : T extends {
      [key: number]: infer N
    }
  ? N
  : never

export interface ParserOptions extends Linter.ParserOptions {
  extensions?: string[] | string
  markdownExtensions?: string[] | string
  filePath?: string
  ignoreRemarkConfig?: boolean
}

export type Traverser = (node: Node, parent?: Parent) => void

export interface MdxNode extends Node {
  type: MdxNodeType
  data?: {
    estree: Program
  }
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
  root: Parent
  tokens: AST.Token[]
}

export interface WorkerProcessResult {
  messages: VFileMessage[]
  content: string
}

export type WorkerResult = WorkerParseResult | WorkerProcessResult
