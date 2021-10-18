/// <reference path="../../typings.d.ts" />

import type { Rule } from 'eslint'
import { isJsxNode } from 'eslint-mdx'

import { getBuiltinRule } from '../helpers'

import type { ExpressionStatementWithParent } from './types'

const esLintNoUnusedExpressions = getBuiltinRule('no-unused-expressions')

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
