import { ExpressionStatement, Node } from 'estree'

export const JSX_TYPES = ['JSXElement', 'JSXFragment'] as const

export type JsxType = (typeof JSX_TYPES)[number]

export interface WithParent {
  parent?: NodeWithParent
}

export type NodeWithParent = Node & WithParent

export interface ExpressionStatementWithParent
  extends ExpressionStatement,
    WithParent {}
