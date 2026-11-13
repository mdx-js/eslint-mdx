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
    const config = getRuleConfig(context, 'no-table-indentation')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      MDTable(node: MDTable) {
        const [first, ...rest] = node.children

        /* istanbul ignore if -- tables have rows */
        if (!first) {
          return
        }

        const lineStart = sourceText.lastIndexOf('\n', first.range[0] - 1) + 1
        const prefix = sourceText.slice(lineStart, first.range[0])
        const leading = /^\s+$/u.test(prefix) ? prefix.length : 0

        if (leading > 0) {
          const spaces = leading === 1 ? 'space' : 'spaces'

          context.report({
            loc: first.loc,
            message: `Unexpected \`${leading}\` extra ${spaces} before table row, remove \`${leading}\` ${spaces}`,
          })
        }

        const expected = first.loc.start.column

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
