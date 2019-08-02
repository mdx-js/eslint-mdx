import { JSXElement, JSXFragment } from '@babel/types'

import { ExpressionStatement, Node } from 'estree'

export type JsxNode = JSXElement | JSXFragment

export type JsxTypes = readonly [JSXElement['type'], JSXFragment['type']]

export type JsxType = JsxTypes[number]

export interface WithParent {
  parent?: NodeWithParent
}

export type NodeWithParent = Node & WithParent

export interface ExpressionStatementWithParent
  extends ExpressionStatement,
    WithParent {}
