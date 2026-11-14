import type { Rule } from 'eslint'
import type { MDBreak } from 'eslint-mdx'

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
    schema: [
      {
        additionalProperties: false,
        properties: { allowSpaces: { type: 'boolean' } },
        type: 'object',
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'hard-break-spaces')

    if (!config) {
      return {}
    }

    const allowSpaces = config.options?.allowSpaces !== false
    const sourceText = context.sourceCode.getText()

    return {
      MDBreak(node: MDBreak) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        const size = raw.length - 1

        if (
          (raw.startsWith('  ') && !allowSpaces) ||
          (raw.startsWith('  ') && size !== 2)
        ) {
          context.report({
            loc: node.loc,
            message: allowSpaces
              ? `Unexpected \`${size}\` spaces for hard break, expected \`2\` spaces`
              : `Unexpected \`${size}\` spaces for hard break, expected escape`,
          })
        }
      },
    }
  },
}
