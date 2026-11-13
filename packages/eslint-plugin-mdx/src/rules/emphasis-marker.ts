import type { Rule } from 'eslint'
import type { MDEmphasis } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'emphasis-marker': '_' | '*' | 'consistent'
  }
}

export const emphasisMarker: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent emphasis marker',
    },
    fixable: 'code',
    schema: [{ enum: ['_', '*', 'consistent'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'emphasis-marker')

    if (!config) {
      return {}
    }

    const { options } = config

    const sourceText = context.sourceCode.getText()

    let expected = options === '*' || options === '_' ? options : undefined

    return {
      MDEmphasis(node: MDEmphasis) {
        const [start, end] = node.range
        const actual = sourceText.charAt(start) as '_' | '*'

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected emphasis marker \`${actual}\`, expected \`${expected}\``,
          fix: fixer => [
            fixer.replaceTextRange([start, start + 1], expected),
            fixer.replaceTextRange([end - 1, end], expected),
          ],
        })
      },
    }
  },
}
