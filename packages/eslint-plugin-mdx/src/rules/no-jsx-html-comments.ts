import { Rule } from 'eslint'
import { Comment, JSX_TYPES, JsxType } from 'eslint-mdx'

import { ExpressionStatementWithParent } from './types'

export const noJsxHtmlComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid invalid html style comments in jsx block',
      category: 'SyntaxError',
      recommended: true,
    },
    messages: {
      jsxHtmlComments: 'html style comments are invalid in jsx: {{ origin }}',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        const invalidNodes: Array<import('unist').Node> =
          context.parserServices.JSXElementsWithHTMLComments

        if (
          !JSX_TYPES.includes(node.expression.type as JsxType) ||
          node.parent.type !== 'Program' ||
          !invalidNodes ||
          invalidNodes.length === 0
        ) {
          return
        }

        const invalidNode = invalidNodes.shift()

        if (invalidNode.data.inline) {
          return
        }

        const comments = invalidNode.data.comments as Comment[]

        comments.forEach(({ fixed, loc, origin }) =>
          context.report({
            messageId: 'jsxHtmlComments',
            data: {
              origin,
            },
            loc,
            node,
            fix(fixer) {
              return fixer.replaceTextRange(
                [loc.start.offset, loc.end.offset],
                fixed,
              )
            },
          }),
        )
      },
    }
  },
} as Rule.RuleModule
