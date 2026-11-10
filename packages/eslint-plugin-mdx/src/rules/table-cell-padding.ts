/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'table-cell-padding': 'compact' | 'consistent' | 'padded' | undefined
  }
}

export const tableCellPadding: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce table cell padding' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'table-cell-padding')
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    return {
      MDTable(node: MDTable) {
        const row = sourceText
          .slice(node.range[0], node.range[1])
          .split('\n')[0]
        const padded = /\|\s/.test(row) && /\s\|/.test(row)
        let expected: 'compact' | 'padded'

        if (config.options === 'padded' || config.options === 'compact') {
          expected = config.options
        } else {
          /* istanbul ignore next -- POC covers explicit options */
          expected = padded ? 'padded' : 'compact'
        }
        if ((expected === 'padded') !== padded) {
          context.report({
            loc: node.loc,
            message: `Unexpected table cell padding, expected ${expected} cells`,
          })
        }
      },
    }
  },
}
