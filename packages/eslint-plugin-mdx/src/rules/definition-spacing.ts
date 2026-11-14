import type { Rule } from 'eslint'
import type { MDDefinition } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'definition-spacing': never
  }
}

export const definitionSpacing: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce spacing in definition labels',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'definition-spacing')

    if (!config) {
      return {}
    }

    return {
      MDDefinition(node: MDDefinition) {
        const match = / {2,}/u.exec(node.label)

        if (match) {
          context.report({
            loc: node.loc,
            message: `Unexpected \`${match[0].length}\` consecutive spaces in definition label, expected \`1\` space, remove \`${match[0].length - 1}\` spaces`,
          })
        }
      },
    }
  },
}
