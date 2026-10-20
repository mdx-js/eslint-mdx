import type { Position } from 'acorn'
import type { AST, Linter } from 'eslint'
import type { BaseNode, Expression, Program } from 'estree'
import type {
  JSXElement,
  JSXExpressionContainer,
  JSXFragment,
  JSXSpreadChild,
  JSXText,
} from 'estree-jsx'
import type { Root } from 'mdast'
import type { VFileMessage } from 'vfile-message'

export interface CommonOptions {
  ignoreRemarkConfig?: boolean
  remarkConfigPath?: string
}

export interface ParserOptions extends Linter.ParserOptions, CommonOptions {
  extensions?: string[] | string
  markdownExtensions?: string[] | string
  filePath?: string
  sourceType?: Linter.SourceType
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

export interface SyncOptions extends CommonOptions {
  cwd?: string
}

export interface WorkerOptions extends SyncOptions {
  filePath: string
  code: string
  isMdx: boolean
  process?: boolean
}

export interface WorkerParseResult {
  root: Root
  body: Program['body']
  comments: Program['comments']
  tokens: AST.Token[]
}

export interface WorkerProcessResult {
  messages: VFileMessage[]
  content?: string
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
  children: MDXContentNode[]
}

export interface MDXFlowExpression extends BaseNode {
  type: 'MDXFlowExpression'
  expression: Expression
}

export interface MDXTextExpression extends BaseNode {
  type: 'MDXTextExpression'
  expression: Expression
}

export interface MDXText extends BaseNode {
  type: 'MDXText'
  value: string
}

export interface MDXParagraph extends BaseNode {
  type: 'MDXParagraph'
  children: MDXContentNode[]
}

export interface MDXBlockquote extends BaseNode {
  type: 'MDXBlockquote'
  children: MDXContentNode[]
}

export interface MDXList extends BaseNode {
  type: 'MDXList'
  ordered?: boolean | null
  start?: number | null
  spread?: boolean | null
  children: MDXListItem[]
}

export interface MDXListItem extends BaseNode {
  type: 'MDXListItem'
  checked?: boolean | null
  spread?: boolean | null
  children: MDXContentNode[]
}

export interface MDXEmphasis extends BaseNode {
  type: 'MDXEmphasis'
  children: MDXContentNode[]
}

export interface MDXStrong extends BaseNode {
  type: 'MDXStrong'
  children: MDXContentNode[]
}

export interface MDXInlineCode extends BaseNode {
  type: 'MDXInlineCode'
  value: string
}

export interface MDXLink extends BaseNode {
  type: 'MDXLink'
  url: string
  title?: string | null
  children: MDXContentNode[]
}

export interface MDXImage extends BaseNode {
  type: 'MDXImage'
  url: string
  title?: string | null
  alt?: string | null
}

export interface MDXBreak extends BaseNode {
  type: 'MDXBreak'
}

export interface MDXThematicBreak extends BaseNode {
  type: 'MDXThematicBreak'
}

export type MDXContentNode =
  | JSXElement
  | JSXExpressionContainer
  | JSXFragment
  | JSXSpreadChild
  | JSXText
  | MDXBlockquote
  | MDXBreak
  | MDXCode
  | MDXEmphasis
  | MDXFlowExpression
  | MDXHeading
  | MDXImage
  | MDXInlineCode
  | MDXLink
  | MDXList
  | MDXListItem
  | MDXParagraph
  | MDXStrong
  | MDXText
  | MDXTextExpression
  | MDXThematicBreak
declare module 'estree' {
  interface ProgramBodyMap {
    MDXBlockquote: MDXBlockquote
    MDXBreak: MDXBreak
    MDXCode: MDXCode
    MDXEmphasis: MDXEmphasis
    MDXFlowExpression: MDXFlowExpression
    MDXHeading: MDXHeading
    MDXImage: MDXImage
    MDXInlineCode: MDXInlineCode
    MDXLink: MDXLink
    MDXList: MDXList
    MDXListItem: MDXListItem
    MDXParagraph: MDXParagraph
    MDXStrong: MDXStrong
    MDXText: MDXText
    MDXTextExpression: MDXTextExpression
    MDXThematicBreak: MDXThematicBreak
  }

  interface TemplateElement {
    start: number
    end: number
  }
}

export interface CjsRequire extends NodeJS.Require {
  <T>(id: string): T
}

export interface PackageJson {
  name: string
  version: string
}

/**
 * Temporary workaround for missing `Ignore` from `unified-engine`
 *
 * See also {@link https://github.com/unifiedjs/unified-engine/pull/79}
 *
 * {@link https://app.unpkg.com/unified-engine@11.2.2/files/lib/ignore.d.ts}
 */

export declare class Ignore {
  constructor(options: Options)
  check(filePath: string, callback: Callback): void
}

export type IgnoreClass = typeof Ignore

export type Callback = (error?: Error, result?: boolean) => void

export interface Options {
  /** Base. */
  cwd: string
  /** Whether to detect ignore files. */
  detectIgnore: boolean | undefined
  /** Basename of ignore files. */
  ignoreName?: string
}
