import type { Rule } from 'eslint'

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
      Program() {
        const lines = sourceText.split('\n')

        for (const [index, line] of lines.entries()) {
          if (!line.includes('|')) {
            continue
          }

          const next = lines[index + 1] ?? ''

          if (!/^[|:\s-]+$/u.test(next)) {
            continue
          }

          const trimmed = line.trim()

          if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
            context.report({
              loc: {
                start: { line: index + 1, column: 0 },
                end: { line: index + 1, column: line.length },
              },
              message: 'Unexpected table row without leading or trailing pipe',
            })
          }
        }
      },
    }
  },
}
