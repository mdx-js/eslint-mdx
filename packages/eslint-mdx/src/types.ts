import type { Position } from 'acorn'
import type { AST, Linter } from 'eslint'
import type { BaseNode, Expression, Program } from 'estree'
import type {
  JSXElement,
  JSXEmptyExpression,
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

export interface MDCode extends BaseNode {
  type: 'MDCode'
  value: string
  lang?: string | null
  meta?: string | null
}

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6

export interface MDHeading extends BaseNode {
  type: 'MDHeading'
  depth: HeadingDepth
  children: MDContentNode[]
}

export interface MDXFlowExpression extends BaseNode {
  type: 'MDXFlowExpression'
  expression: Expression | JSXEmptyExpression
}

export interface MDXTextExpression extends BaseNode {
  type: 'MDXTextExpression'
  expression: Expression | JSXEmptyExpression
}

export interface MDText extends BaseNode {
  type: 'MDText'
  value: string
}

export interface MDParagraph extends BaseNode {
  type: 'MDParagraph'
  children: MDContentNode[]
}

export interface MDBlockquote extends BaseNode {
  type: 'MDBlockquote'
  children: MDContentNode[]
}

export interface MDList extends BaseNode {
  type: 'MDList'
  ordered?: boolean | null
  start?: number | null
  spread?: boolean | null
  children: MDListItem[]
}

export interface MDListItem extends BaseNode {
  type: 'MDListItem'
  checked?: boolean | null
  spread?: boolean | null
  children: MDContentNode[]
}

export interface MDEmphasis extends BaseNode {
  type: 'MDEmphasis'
  children: MDContentNode[]
}

export interface MDStrong extends BaseNode {
  type: 'MDStrong'
  children: MDContentNode[]
}

export interface MDInlineCode extends BaseNode {
  type: 'MDInlineCode'
  value: string
}

export interface MDLink extends BaseNode {
  type: 'MDLink'
  url: string
  title?: string | null
  children: MDContentNode[]
}

export interface MDImage extends BaseNode {
  type: 'MDImage'
  url: string
  title?: string | null
  alt?: string | null
}

export interface MDBreak extends BaseNode {
  type: 'MDBreak'
}

export interface MDThematicBreak extends BaseNode {
  type: 'MDThematicBreak'
}

export interface MDDefinition extends BaseNode {
  type: 'MDDefinition'
  identifier: string
  label?: string | null
  url: string
  title?: string | null
}

export interface MDDelete extends BaseNode {
  type: 'MDDelete'
  children: MDContentNode[]
}

export interface MDFootnoteDefinition extends BaseNode {
  type: 'MDFootnoteDefinition'
  identifier: string
  label?: string | null
  children: MDContentNode[]
}

export interface MDFootnoteReference extends BaseNode {
  type: 'MDFootnoteReference'
  identifier: string
  label?: string | null
}

export interface MDImageReference extends BaseNode {
  type: 'MDImageReference'
  identifier: string
  label?: string | null
  referenceType: 'collapsed' | 'full' | 'shortcut'
  alt?: string | null
}

export interface MDInlineMath extends BaseNode {
  type: 'MDInlineMath'
  value: string
}

export interface MDLinkReference extends BaseNode {
  type: 'MDLinkReference'
  identifier: string
  label?: string | null
  referenceType: 'collapsed' | 'full' | 'shortcut'
  children: MDContentNode[]
}

export interface MDMath extends BaseNode {
  type: 'MDMath'
  value: string
  meta?: string | null
}

export interface MDTable extends BaseNode {
  type: 'MDTable'
  align?: Array<'center' | 'left' | 'right' | null> | null
  children: MDTableRow[]
}

export interface MDTableCell extends BaseNode {
  type: 'MDTableCell'
  children: MDContentNode[]
}

export interface MDTableRow extends BaseNode {
  type: 'MDTableRow'
  children: MDTableCell[]
}

export interface MDToml extends BaseNode {
  type: 'MDToml'
  value: string
}

export interface MDYaml extends BaseNode {
  type: 'MDYaml'
  value: string
}

export type MDContentNode =
  | JSXElement
  | JSXExpressionContainer
  | JSXFragment
  | JSXSpreadChild
  | JSXText
  | MDBlockquote
  | MDBreak
  | MDCode
  | MDDefinition
  | MDDelete
  | MDEmphasis
  | MDFootnoteDefinition
  | MDFootnoteReference
  | MDHeading
  | MDImage
  | MDImageReference
  | MDInlineCode
  | MDInlineMath
  | MDLink
  | MDLinkReference
  | MDList
  | MDListItem
  | MDMath
  | MDParagraph
  | MDStrong
  | MDTable
  | MDTableCell
  | MDTableRow
  | MDText
  | MDThematicBreak
  | MDToml
  | MDXFlowExpression
  | MDXTextExpression
  | MDYaml

declare module 'eslint' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace AST {
    interface Token {
      micromarkType?: string
    }
  }
}

declare module 'acorn' {
  interface Token {
    value?: string
  }
}

declare module 'estree' {
  interface ProgramBodyMap {
    // Markdown
    MDBlockquote: MDBlockquote
    MDBreak: MDBreak
    MDCode: MDCode
    MDDefinition: MDDefinition
    MDDelete: MDDelete
    MDEmphasis: MDEmphasis
    MDFootnoteDefinition: MDFootnoteDefinition
    MDFootnoteReference: MDFootnoteReference
    MDHeading: MDHeading
    MDImage: MDImage
    MDImageReference: MDImageReference
    MDInlineCode: MDInlineCode
    MDInlineMath: MDInlineMath
    MDLink: MDLink
    MDLinkReference: MDLinkReference
    MDList: MDList
    MDListItem: MDListItem
    MDMath: MDMath
    MDParagraph: MDParagraph
    MDStrong: MDStrong
    MDTable: MDTable
    MDTableCell: MDTableCell
    MDTableRow: MDTableRow
    MDText: MDText
    MDThematicBreak: MDThematicBreak
    MDToml: MDToml
    MDYaml: MDYaml

    // MDX
    MDXFlowExpression: MDXFlowExpression
    MDXTextExpression: MDXTextExpression
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
