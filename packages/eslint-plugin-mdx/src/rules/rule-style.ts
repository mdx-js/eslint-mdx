import type { Rule } from 'eslint'
import type { MDThematicBreak } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'rule-style': string | undefined
  }
}

export const ruleStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent thematic rule style',
    },
    fixable: 'code',
    schema: [{ type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'rule-style')

    if (!config) {
      return {}
    }

    let expected =
      typeof config.options === 'string' && config.options !== 'consistent'
        ? config.options
        : undefined

    return {
      MDThematicBreak(node: MDThematicBreak) {
        const actual = node.raw

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected thematic rule \`${actual}\`, expected \`${expected}\``,
          fix: fixer => fixer.replaceTextRange(node.range, expected),
        })
      },
    }
  },
}
