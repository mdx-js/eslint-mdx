import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'strong-marker': '_' | '*' | 'consistent'
  }
}

export const strongMarker: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent strong marker',
    },
    fixable: 'code',
    schema: [{ enum: ['_', '*', 'consistent'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'strong-marker')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the explicit marker option */
    let expected: '_' | '*' | undefined =
      config.options === '*' || config.options === '_'
        ? config.options
        : undefined

    return {
      MDStrong(node) {
        const [start, end] = node.range
        const actual = sourceText.charAt(start) as '_' | '*'

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected strong marker \`${actual}\`, expected \`${expected}\``,
          fix: fixer => [
            fixer.replaceTextRange([start, start + 2], expected.repeat(2)),
            fixer.replaceTextRange([end - 2, end], expected.repeat(2)),
          ],
        })
      },
    }
  },
}
