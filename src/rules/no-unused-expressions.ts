// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../../types.d.ts" />

import ESLintNoUnUsedExpressions from 'eslint/lib/rules/no-unused-expressions'

import { Rule } from 'eslint'
import { ExpressionStatement, Node } from 'estree'

export const JSX_TYPES = ['JSXElement', 'JSXFragment'] as const

export type JsxType = (typeof JSX_TYPES)[number]

export interface ExpressionStatementWithParent extends ExpressionStatement {
  parent?: {
    type: Node['type']
  }
}

export const noUnUsedExpressions: Rule.RuleModule = {
  create(context) {
    const esLintRuleListener = ESLintNoUnUsedExpressions.create(context)
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        if (
          JSX_TYPES.includes(node.expression.type as JsxType) &&
          node.parent.type === 'Program'
        ) {
          return
        }
        esLintRuleListener.ExpressionStatement(node)
      },
    }
  },
}
