import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'table-pipes': never
  }
}

export const tablePipes: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce table pipes' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'table-pipes')

    if (!config) {
      return {}
    }

    return {
      MDTable(node: MDTable) {
        for (const row of node.children) {
          const raw = row.raw
          const trimmed = raw.trim()

          if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
            context.report({
              loc: row.loc,
              message: 'Unexpected table row without leading or trailing pipe',
            })
          }
        }
      },
    }
  },
}
