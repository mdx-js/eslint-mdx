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

    const sourceText = context.sourceCode.getText()

    return {
      MDTable(node: MDTable) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        const lines = raw.split('\n')

        for (const [index, line] of lines.entries()) {
          const match = /^( +)/u.exec(line)

          if (!match) {
            continue
          }

          const difference = match[1].length

          context.report({
            loc: {
              start: {
                line: node.loc.start.line + index,
                column: 1,
              },
              end: {
                line: node.loc.start.line + index,
                column: difference + 1,
              },
            },
            message: `Unexpected \`${difference}\` extra ${difference === 1 ? 'space' : 'spaces'} before table row, remove \`${difference}\` ${difference === 1 ? 'space' : 'spaces'}`,
          })
        }
      },
    }
  },
}
