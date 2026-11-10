/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-content-indent': never
  }
}

export const listItemContentIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item content indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-content-indent')
    if (!config) {
      return {}
    }
    return {}
  },
}
