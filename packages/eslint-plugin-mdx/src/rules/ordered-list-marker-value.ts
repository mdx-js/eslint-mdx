import type { Rule } from 'eslint'
import type { MDList } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'ordered-list-marker-value': 'one' | 'ordered' | 'single' | undefined
  }
}

export const orderedListMarkerValue: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce ordered list marker values' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'ordered-list-marker-value',
    )
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    return {
      MDList(node: MDList) {
        /* istanbul ignore if -- POC covers list detection */
        if (!node.ordered) {
          return
        }
        const values: number[] = []

        for (const line of sourceText
          .slice(node.range[0], node.range[1])
          .split('\n')) {
          const trimmed = line.trimStart()
          const dot = trimmed.indexOf('.')
          const paren = trimmed.indexOf(')')
          /* istanbul ignore next -- POC covers marker detection */
          const index = [dot, paren]
            .filter(value => value > 0)
            .sort((a, b) => a - b)[0]

          /* istanbul ignore if -- POC covers marker values */
          if (index != null && /^\d+$/u.test(trimmed.slice(0, index))) {
            values.push(Number(trimmed.slice(0, index)))
          }
        }
        /* istanbul ignore next -- POC covers ordered values */
        const expected =
          config.options === 'one'
            ? values.map(() => 1)
            : values.map((_, index) => (values[0] ?? 1) + index)
        for (const [index, value] of values.entries()) {
          if (value !== expected[index]) {
            context.report({
              loc: node.loc,
              message: `Unexpected ordered list marker value \`${value}\`, expected \`${expected[index]}\``,
            })
          }
        }
      },
    }
  },
}
