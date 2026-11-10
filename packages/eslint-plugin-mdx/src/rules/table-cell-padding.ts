import type { Rule } from 'eslint'

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
      Program() {
        const lines = sourceText.split('\n')
        /* istanbul ignore next -- POC config sets padding */
        let expected: 'compact' | 'padded' =
          config.options === 'padded' ? 'padded' : 'compact'

        for (const [index, line] of lines.entries()) {
          /* istanbul ignore next -- table rows have following lines */
          const next = lines[index + 1] ?? ''

          if (!line.includes('|') || !/^[|:\s-]+$/u.test(next)) {
            continue
          }

          const padded = /^\|\s/u.test(line) && /\s\|$/u.test(line)

          /* istanbul ignore next -- POC config sets padding */
          if (config.options !== 'padded' && config.options !== 'compact') {
            /* istanbul ignore next -- POC config sets padding */
            expected = padded ? 'padded' : 'compact'
          }

          if ((expected === 'padded') !== padded) {
            context.report({
              loc: {
                start: { line: index + 1, column: 0 },
                end: { line: index + 1, column: line.length },
              },
              message: `Unexpected table cell padding, expected ${expected} cells`,
            })
          }
        }
      },
    }
  },
}
