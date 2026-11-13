import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'heading-increment': never
  }
}

export const headingIncrement: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn when heading ranks increment by more than one',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'heading-increment')

    if (!config) {
      return {}
    }

    let previous = 0

    return {
      MDHeading(node: MDHeading) {
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
