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

/**
 * MDX expression containers keep the original mdast value so native rules can
 * reproduce remark's text normalization without reparsing raw source.
 */
declare module 'estree-jsx' {
  interface JSXExpressionContainer {
    value?: string
  }
}

export interface CommonOptions {
  ignoreRemarkConfig?: boolean
  remarkConfigPath?: string
}

export interface ParserOptions extends Linter.ParserOptions, CommonOptions {
  ecmaVersion?: Linter.LanguageOptions['ecmaVersion']
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
  ignoreRemarkRules?: ReadonlySet<string>
}

export interface WorkerOptions extends SyncOptions {
  filePath: string
  code: string
  isMdx: boolean
  process?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmented by rule packages
export interface RemarkRuleOptions {}

export interface RemarkConfig {
  ruleOptions: RemarkRuleOptions
}

export interface WorkerParseResult {
  root: Root
  body: Program['body']
  comments: Program['comments']
  tokens: AST.Token[]
  remarkConfig?: RemarkConfig
}

export interface WorkerProcessResult {
  messages: VFileMessage[]
  content?: string
}

export type WorkerResult = WorkerParseResult | WorkerProcessResult

type _Arrayable<T, R = T extends Array<infer U> ? U : T> = R | R[]

export type Arrayable<T> = _Arrayable<T>

export interface MDBaseNode extends BaseNode {
  raw: string
}

export interface MDCode extends MDBaseNode {
  type: 'MDCode'
  value: string
  lang?: string | null
  meta?: string | null
}

export type HeadingDepth = 1 | 2 | 3 | 4 | 5 | 6

export interface MDHeading extends MDBaseNode {
  type: 'MDHeading'
  depth: HeadingDepth
  children: MDContentNode[]
}

export interface MDXFlowExpression extends BaseNode {
  type: 'MDXFlowExpression'
  expression: Expression | JSXEmptyExpression
  value?: string
}

export interface MDXTextExpression extends BaseNode {
  type: 'MDXTextExpression'
  expression: Expression | JSXEmptyExpression
  value?: string
}

export interface MDHtml extends MDBaseNode {
  type: 'MDHtml'
  value: string
}

export interface MDText extends MDBaseNode {
  type: 'MDText'
  value: string
}

export interface MDParagraph extends MDBaseNode {
  type: 'MDParagraph'
  children: MDContentNode[]
}

export interface MDBlockquote extends MDBaseNode {
  type: 'MDBlockquote'
  children: MDContentNode[]
}

export interface MDList extends MDBaseNode {
  type: 'MDList'
  ordered?: boolean | null
  start?: number | null
  spread?: boolean | null
  children: MDListItem[]
}

export interface MDListItem extends MDBaseNode {
  type: 'MDListItem'
  checked?: boolean | null
  spread?: boolean | null
  children: MDContentNode[]
}

export interface MDEmphasis extends MDBaseNode {
  type: 'MDEmphasis'
  children: MDContentNode[]
}

export interface MDStrong extends MDBaseNode {
  type: 'MDStrong'
  children: MDContentNode[]
}

export interface MDInlineCode extends MDBaseNode {
  type: 'MDInlineCode'
  value: string
}

export interface MDLink extends MDBaseNode {
  type: 'MDLink'
  url: string
  title?: string | null
  children: MDContentNode[]
}

export interface MDImage extends MDBaseNode {
  type: 'MDImage'
  url: string
  title?: string | null
  alt?: string | null
}

export interface MDBreak extends MDBaseNode {
  type: 'MDBreak'
}

export interface MDThematicBreak extends MDBaseNode {
  type: 'MDThematicBreak'
}

export interface MDDefinition extends MDBaseNode {
  type: 'MDDefinition'
  identifier: string
  label?: string | null
  url: string
  title?: string | null
}

export interface MDDelete extends MDBaseNode {
  type: 'MDDelete'
  children: MDContentNode[]
}

export interface MDFootnoteDefinition extends MDBaseNode {
  type: 'MDFootnoteDefinition'
  identifier: string
  label?: string | null
  children: MDContentNode[]
}

export interface MDFootnoteReference extends MDBaseNode {
  type: 'MDFootnoteReference'
  identifier: string
  label?: string | null
}

export interface MDImageReference extends MDBaseNode {
  type: 'MDImageReference'
  identifier: string
  label?: string | null
  referenceType: 'collapsed' | 'full' | 'shortcut'
  alt?: string | null
}

export interface MDInlineMath extends MDBaseNode {
  type: 'MDInlineMath'
  value: string
}

export interface MDLinkReference extends MDBaseNode {
  type: 'MDLinkReference'
  identifier: string
  label?: string | null
  referenceType: 'collapsed' | 'full' | 'shortcut'
  children: MDContentNode[]
}

export interface MDMath extends MDBaseNode {
  type: 'MDMath'
  value: string
  meta?: string | null
}

export interface MDTable extends MDBaseNode {
  type: 'MDTable'
  align?: Array<'center' | 'left' | 'right' | null> | null
  children: MDTableRow[]
}

export interface MDTableCell extends MDBaseNode {
  type: 'MDTableCell'
  children: MDContentNode[]
}

export interface MDTableRow extends MDBaseNode {
  type: 'MDTableRow'
  children: MDTableCell[]
}

export interface MDToml extends MDBaseNode {
  type: 'MDToml'
  value: string
}

export interface MDYaml extends MDBaseNode {
  type: 'MDYaml'
  value: string
}

export type MDContentNode =
  | JSXElement
  | JSXExpressionContainer
  | JSXFragment
  | JSXSpreadChild
  | JSXText
  | MDNodeMap[keyof MDNodeMap]

declare module 'acorn' {
  interface Token {
    value?: string
  }
}

export interface MDNodeMap {
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
  MDHtml: MDHtml
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

declare module 'estree' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging
  interface NodeMap extends MDNodeMap {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging
  interface ProgramBodyMap extends MDNodeMap {}

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
