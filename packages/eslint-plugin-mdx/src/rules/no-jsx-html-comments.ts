import type { Rule } from 'eslint'
import type { Comment, ParserServices } from 'eslint-mdx'
import { isJsxNode } from 'eslint-mdx'

import type { ExpressionStatementWithParent } from './types'

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
  },
  create(context) {
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        const {
          JSXElementsWithHTMLComments: invalidNodes,
        } = context.parserServices as ParserServices

        if (
          !isJsxNode(node.expression) ||
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

        for (const { fixed, loc, origin } of comments) {
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
          })
        }
      },
    }
  },
}
