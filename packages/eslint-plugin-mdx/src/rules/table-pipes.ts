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
    const config = getRuleConfig(context.sourceCode, 'table-pipes')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      MDTable(node: MDTable) {
        for (const row of node.children) {
          const raw = sourceText.slice(row.range[0], row.range[1])
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
