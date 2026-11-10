/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'hard-break-spaces': { allowSpaces?: boolean } | undefined
  }
}

export const hardBreakSpaces: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce hard break spaces' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'hard-break-spaces')

    if (!config) {
      return {}
    }

    const allowSpaces = config.options?.allowSpaces !== false
    const sourceText = context.sourceCode.getText()

    return {
      Program() {
        for (const [index, line] of sourceText.split('\n').entries()) {
          if (!line.endsWith('  ')) {
            continue
          }

          let size = 0

          while (line.at(-1 - size) === ' ') {
            size++
          }

          if (!allowSpaces) {
            context.report({
              loc: {
                start: { line: index + 1, column: line.length },
                end: { line: index + 1, column: line.length },
              },
              message: `Unexpected \`${size}\` spaces for hard break, expected escape`,
            })
          } else if (size !== 2) {
            context.report({
              loc: {
                start: { line: index + 1, column: line.length },
                end: { line: index + 1, column: line.length },
              },
              message: `Unexpected \`${size}\` spaces for hard break, expected \`2\` spaces`,
            })
          }
        }
      },
    }
  },
}
