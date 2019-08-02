import { JsxNode, JsxType, JsxTypes } from './types'

export const JSX_TYPES: JsxTypes = ['JSXElement', 'JSXFragment']

export const isJsxNode = (node: { type: string }): node is JsxNode =>
  JSX_TYPES.includes(node.type as JsxType)
