import type { Rule } from 'eslint'

import { getRuleConfig } from './native-helpers.js'

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
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'emphasis-marker')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let expected: '_' | '*' | undefined =
      config.options === '*' || config.options === '_'
        ? config.options
        : undefined

    return {
      MDEmphasis(node) {
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
    } as unknown as Rule.RuleListener
  },
}
