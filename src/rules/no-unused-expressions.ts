// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../../types.d.ts" />

import esLintNoUnUsedExpressions from 'eslint/lib/rules/no-unused-expressions'

import { ExpressionStatementWithParent, JSX_TYPES, JsxType } from './types'

import { Rule } from 'eslint'

export const noUnUsedExpressions: Rule.RuleModule = {
  ...esLintNoUnUsedExpressions,
  create(context) {
    const esLintRuleListener = esLintNoUnUsedExpressions.create(context)
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
