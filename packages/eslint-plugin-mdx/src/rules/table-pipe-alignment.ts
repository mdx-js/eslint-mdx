import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'table-pipe-alignment': never
  }
}

const positions = (line: string) =>
  [...line]
    .map((char, index) => (char === '|' ? index : -1))
    .filter(index => index >= 0)

export const tablePipeAlignment: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce table pipe alignment' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'table-pipe-alignment')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      MDTable(node: MDTable) {
        const [first, ...rest] = node.children
        /* istanbul ignore next -- table rows exist */
        const expected = positions(
          sourceText.slice(first?.range[0] ?? 0, first?.range[1] ?? 0),
        )

        for (const row of rest) {
          const actual = positions(sourceText.slice(row.range[0], row.range[1]))

          if (
            actual.length !== expected.length ||
            actual.some((value, index) => value !== expected[index])
          ) {
            context.report({
              loc: row.loc,
              message: 'Unexpected unaligned cell, expected aligned pipes',
            })
          }
        }
      },
    }
  },
}
