import type { Rule } from 'eslint'

import { getRuleOptions, type MarkdownNode } from './native-helpers.js'

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
      MDHeading(node: MarkdownNode) {
        const depth = node.depth
        const expected = previous + 1

        if (previous > 0 && depth > expected) {
          context.report({
            loc: node.loc,
            message: `Unexpected heading rank \`${depth}\`, exected rank \`${expected}\``,
          })
        }

        previous = depth
      },
    }
  },
}
