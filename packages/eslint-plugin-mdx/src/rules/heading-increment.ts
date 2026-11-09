import type { Rule } from 'eslint'

import { getLoc, getRuleOptions, visitMarkdown } from './native-helpers.js'

export const headingIncrement: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn when heading ranks increment by more than one',
    },
    schema: [],
  },
  create(context) {
    const rule = getRuleOptions(context.sourceCode, 'heading-increment')

    if (!rule?.enabled) {
      return {}
    }

    let previous = 0

    return {
      Program() {
        visitMarkdown(context.sourceCode.ast.body, 'MDHeading', node => {
          const expected = previous + 1

          if (previous > 0 && node.depth > expected) {
            context.report({
              loc: getLoc(node),
              message: `Unexpected heading rank \`${node.depth}\`, exected rank \`${expected}\``,
            })
          }

          previous = node.depth
        })
      },
    }
  },
}
