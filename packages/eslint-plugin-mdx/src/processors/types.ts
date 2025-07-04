import type { SyncOptions } from 'eslint-mdx'
import type { Code } from 'mdast'

export interface ESLintMdxSettings {
  'mdx/code-blocks'?: boolean
  'mdx/language-mapper'?: Record<string, string> | false
  'mdx/ignore-remark-config'?: boolean
  'mdx/remark-config-path'?: string
}

export interface ProcessorOptions extends SyncOptions {
  lintCodeBlocks?: boolean
  languageMapper?: Record<string, string> | false
}

export interface RangeMap {
  indent: number
  js: number
  md: number
}

export interface CodeBlock extends Code {
  baseIndentText: string
  comments: string[]
  rangeMap: RangeMap[]
}
