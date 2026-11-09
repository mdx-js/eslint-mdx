import type { Rule } from 'eslint'
import type { MDEmphasis } from 'eslint-mdx'

import { getRuleOptions } from './native-helpers.js'

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
    const rule = getRuleOptions(context.sourceCode, 'emphasis-marker')

    if (!rule?.enabled) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let expected =
      rule.options === '*' || rule.options === '_' ? rule.options : undefined

    return {
      MDEmphasis(node: MDEmphasis) {
        const [start, end] = node.range
        const actual = sourceText.charAt(start)

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
