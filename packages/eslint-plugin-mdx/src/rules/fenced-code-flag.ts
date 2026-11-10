/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDCode } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'fenced-code-flag': unknown
  }
}

export const fencedCodeFlag: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Require fenced code language flags' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'fenced-code-flag')

    if (!config) {
      return {}
    }

    return {
      MDCode(node: MDCode) {
        if (node.lang) {
          return
        }

        context.report({
          loc: node.loc,
          message:
            'Unexpected missing fenced code language flag in info string, expected keyword',
        })
      },
    }
  },
}
