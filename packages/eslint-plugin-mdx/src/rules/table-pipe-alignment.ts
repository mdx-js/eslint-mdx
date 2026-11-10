/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'table-pipe-alignment': never
  }
}

export const tablePipeAlignment: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce table pipe alignment' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'table-pipe-alignment')
    if (!config) {
      return {}
    }
    return {}
  },
}
