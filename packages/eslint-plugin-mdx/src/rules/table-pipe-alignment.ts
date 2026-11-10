/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

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
    const sourceText = context.sourceCode.getText()
    return {
      MDTable(node: MDTable) {
        const rows = sourceText.slice(node.range[0], node.range[1]).split('\n')
        const positions = (line: string) =>
          [...line]
            .map((char, index) => (char === '|' ? index : -1))
            .filter(index => index >= 0)
        const expected = positions(rows[1] ?? '')
        for (const [index, row] of rows.entries()) {
          const actual = positions(row)
          if (
            actual.length !== expected.length ||
            actual.some((value, position) => value !== expected[position])
          ) {
            context.report({
              loc: {
                start: { line: node.loc.start.line + index, column: 0 },
                end: { line: node.loc.start.line + index, column: 0 },
              },
              message: 'Unexpected unaligned cell, expected aligned pipes',
            })
          }
        }
      },
    }
  },
}
