import { ExpressionStatementWithParent, JSX_TYPES, JsxType } from './types'

import { Rule } from 'eslint'
import { Node } from 'unist'

export const noJsxHtmlComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid invalid html style comments in jsx block',
      category: 'SyntaxError',
      recommended: true,
    },
    messages: {
      jdxHtmlComments: 'html style comments are invalid in jsx: {{ raw }}',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        const invalidNodes: Node[] =
          context.parserServices.JSXElementsWithHTMLComments

        if (
          !JSX_TYPES.includes(node.expression.type as JsxType) ||
          node.parent.type !== 'Program' ||
          !invalidNodes ||
          !invalidNodes.length
        ) {
          return
        }

        const invalidNode = invalidNodes.shift()
        // unist column is 1-indexed, but estree is 0-indexed...
        const { start, end } = invalidNode.position
        context.report({
          messageId: 'jdxHtmlComments',
          data: {
            raw: invalidNode.raw as string,
          },
          loc: {
            start: {
              ...start,
              column: start.column - 1,
            },
            end: {
              ...end,
              column: end.column - 1,
            },
          },
          fix(fixer) {
            return fixer.replaceTextRange(
              [start.offset, end.offset],
              invalidNode.value as string,
            )
          },
        })
      },
    }
  },
} as Rule.RuleModule
