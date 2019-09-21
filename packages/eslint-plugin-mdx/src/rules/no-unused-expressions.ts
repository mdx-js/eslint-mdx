/// <reference path="../../typings.d.ts" />

import { Rule } from 'eslint'
import { isJsxNode } from 'eslint-mdx'
import esLintNoUnusedExpressions from 'eslint/lib/rules/no-unused-expressions'

import { ExpressionStatementWithParent } from './types'

export const noUnusedExpressions: Rule.RuleModule = {
  ...esLintNoUnusedExpressions,
  create(context) {
    const esLintRuleListener = esLintNoUnusedExpressions.create(context)
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
