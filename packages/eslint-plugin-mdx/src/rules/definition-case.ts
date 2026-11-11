import type { Rule } from 'eslint'
import type { MDDefinition, MDFootnoteDefinition } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'definition-case': never
  }
}

export const definitionCase: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce lowercase definition labels',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'definition-case')

    if (!config) {
      return {}
    }

    const check = (
      node: MDDefinition | MDFootnoteDefinition,
      footnote: boolean,
    ) => {
      if (node.label && node.label !== node.label.toLowerCase()) {
        context.report({
          loc: node.loc,
          message: `Unexpected uppercase characters in ${footnote ? 'footnote ' : ''}definition label, expected lowercase`,
        })
      }
    }

    return {
      MDDefinition(node) {
        check(node, false)
      },
      MDFootnoteDefinition(node) {
        check(node, true)
      },
    }
  },
}
