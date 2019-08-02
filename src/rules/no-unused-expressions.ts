// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../../types.d.ts" />

import esLintNoUnUsedExpressions from 'eslint/lib/rules/no-unused-expressions'

import { isJsxNode } from './helper'
import { ExpressionStatementWithParent } from './types'

import { Rule } from 'eslint'

export const noUnUsedExpressions: Rule.RuleModule = {
  ...esLintNoUnUsedExpressions,
  create(context) {
    const esLintRuleListener = esLintNoUnUsedExpressions.create(context)
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        if (isJsxNode(node.expression) && node.parent.type === 'Program') {
          return
        }
        esLintRuleListener.ExpressionStatement(node)
      },
    }
  },
}
