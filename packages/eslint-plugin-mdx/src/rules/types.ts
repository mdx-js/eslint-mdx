// eslint-disable-next-line node/no-extraneous-import
import { ExpressionStatement, Node } from 'estree'
import { Attacher } from 'unified'

export interface WithParent {
  parent?: NodeWithParent
}

export type NodeWithParent = Node & WithParent

export interface ExpressionStatementWithParent
  extends ExpressionStatement,
    WithParent {}

export type RemarkPlugin = string | Attacher

export interface RemarkConfig {
  settings: Record<string, string>
  plugins: Array<RemarkPlugin | [RemarkPlugin, ...unknown[]]>
}
