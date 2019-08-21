import { Attacher } from 'unified'

import { Node, ExpressionStatement } from 'estree'

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
