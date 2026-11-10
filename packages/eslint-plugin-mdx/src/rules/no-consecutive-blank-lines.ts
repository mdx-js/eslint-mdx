import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-consecutive-blank-lines': never
  }
}

export const noConsecutiveBlankLines: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow consecutive blank lines',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-consecutive-blank-lines',
    )

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      Program() {
        for (const match of sourceText.matchAll(/\n{3,}/gu)) {
          /* istanbul ignore next -- matchAll always provides an index */
          const index = match.index ?? 0
          const line = sourceText.slice(0, index).split('\n').length + 1
          const count = match[0].length - 2

          context.report({
            loc: {
              start: { line, column: 0 },
              end: { line: line + count, column: 0 },
            },
            message: `Unexpected \`${count}\` blank lines before node, expected up to \`1\` blank line, remove \`${count - 1}\` blank line`,
          })
        }
      },
    }
  },
}
