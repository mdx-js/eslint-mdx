import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-table-indentation': never
  }
}

export const noTableIndentation: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow indentation before table rows',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-table-indentation')

    if (!config) {
      return {}
    }

    return {
      MDTable(node: MDTable) {
        const [first, ...rest] = node.children
        /* istanbul ignore next -- tables have rows */
        const expected = first?.loc?.start.column ?? 0

        for (const row of rest) {
          const actual = row.loc.start.column - expected

          if (actual > 0) {
            const spaces = actual === 1 ? 'space' : 'spaces'

            context.report({
              loc: row.loc,
              message: `Unexpected \`${actual}\` extra ${spaces} before table row, remove \`${actual}\` ${spaces}`,
            })
          }
        }
      },
    }
  },
}
