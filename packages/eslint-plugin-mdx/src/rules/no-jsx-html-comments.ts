import { Rule } from 'eslint'
import { Comment, JSX_TYPES, JsxType, ParserServices } from 'eslint-mdx'

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
  },
  create(context) {
    return {
      ExpressionStatement(node: ExpressionStatementWithParent) {
        const invalidNodes = (context.parserServices as ParserServices)
          .JSXElementsWithHTMLComments

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
