/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'final-definition': never
  }
}

export const finalDefinition: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Require definitions at the end' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'final-definition')
    if (!config) {
      return {}
    }
    return {}
  },
}
