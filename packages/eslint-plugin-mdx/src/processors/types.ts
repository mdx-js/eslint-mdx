import type { Code } from 'mdast'

export interface ESLintMdxSettings {
  'mdx/code-blocks'?: boolean
  'mdx/language-mapper'?: Record<string, string> | false
}

export interface ProcessorOptions {
  lintCodeBlocks: boolean
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
