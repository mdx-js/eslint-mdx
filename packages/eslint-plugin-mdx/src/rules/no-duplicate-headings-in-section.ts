import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-duplicate-headings-in-section': never
  }
}

export const noDuplicateHeadingsInSection: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate headings within a section',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-duplicate-headings-in-section',
    )

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    const stack: Array<Map<string, MDHeading>> = []

    return {
      MDHeading(node) {
        const rank = node.depth
        const value = sourceText
          .slice(node.range[0], node.range[1])
          .replace(/^\s*#{1,6}\s*/u, '')
          .trim()
          .toLowerCase()
        const map = stack[rank - 1] ?? new Map<string, MDHeading>()
        stack[rank - 1] = map

        if (map.has(value)) {
          context.report({
            loc: node.loc,
            message:
              'Unexpected heading with equivalent text in section, expected unique headings',
          })
        }

        map.set(value, node)
        stack.length = rank
      },
    }
  },
}
