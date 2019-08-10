// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../typings.d.ts" />

import esLintNoUnusedExpressions from 'eslint/lib/rules/no-unused-expressions'
import { isJsxNode } from 'eslint-mdx'

import { ExpressionStatementWithParent } from './types'

import { Rule } from 'eslint'

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
