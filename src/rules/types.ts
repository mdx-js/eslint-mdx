import { ExpressionStatement, Node } from 'estree'

export const JSX_TYPES = ['JSXElement', 'JSXFragment'] as const

export type JsxType = (typeof JSX_TYPES)[number]

export interface ExpressionStatementWithParent extends ExpressionStatement {
  parent?: {
    type: Node['type']
  }
}
