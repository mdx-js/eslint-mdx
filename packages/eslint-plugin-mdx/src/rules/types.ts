import type { Linter } from 'eslint'
import type { ExpressionStatement, Node } from 'estree'

export interface WithParent {
  parent: NodeWithParent
}

export type NodeWithParent = Node & WithParent

export interface ExpressionStatementWithParent
  extends ExpressionStatement,
    WithParent {}

export interface RemarkLintMessage {
  reason: string
  source: string
  ruleId: string
  severity: Linter.Severity
}
