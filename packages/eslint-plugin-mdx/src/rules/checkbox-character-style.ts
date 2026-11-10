/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'checkbox-character-style': unknown
  }
}

export const checkboxCharacterStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce checkbox character style' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'checkbox-character-style')
    if (!config) {
      return {}
    }
    return {}
  },
}
