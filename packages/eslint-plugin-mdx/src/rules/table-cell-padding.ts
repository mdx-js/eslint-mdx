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
    schema: [{ enum: ['compact', 'consistent', 'padded'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'table-cell-padding')

    if (!config) {
      return {}
    }

    return {
      MDTable(node: MDTable) {
        let expected: 'compact' | 'padded' | undefined =
          config.options === 'padded' || config.options === 'compact'
            ? config.options
            : undefined

        for (const row of node.children) {
          const raw = row.raw
          const padded = /^\|\s/u.test(raw) && /\s\|$/u.test(raw)
          expected ??= padded ? 'padded' : 'compact'

          if ((expected === 'padded') !== padded) {
            context.report({
              loc: row.loc,
              message: `Unexpected table cell padding, expected ${expected} cells`,
            })
          }
        }
      },
    }
  },
}
