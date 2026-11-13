import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-multiple-toplevel-headings': number | undefined
  }
}

export const noMultipleToplevelHeadings: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow multiple top-level headings',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-multiple-toplevel-headings')

    /* istanbul ignore if -- rule is enabled by config */
    if (!config) {
      return {}
    }

    const rank = config.options || 1
    let seen = false

    return {
      MDHeading(node) {
        if (node.depth !== rank) {
          return
        }

        if (seen) {
          context.report({
            loc: node.loc,
            message: `Unexpected duplicate toplevel heading, exected a single heading with rank \`${rank}\``,
          })
        }

        seen = true
      },
    }
  },
}
