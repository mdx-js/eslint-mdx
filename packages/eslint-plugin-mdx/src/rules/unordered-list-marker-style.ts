import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'unordered-list-marker-style': '-' | '*' | '+' | 'consistent'
  }
}

type Marker = '-' | '*' | '+'

export const unorderedListMarkerStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent unordered list marker',
    },
    fixable: 'code',
    schema: [{ enum: ['-', '*', '+', 'consistent'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'unordered-list-marker-style')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the explicit marker option */
    let expected: Marker | undefined =
      config.options === '*' || config.options === '+' || config.options === '-'
        ? config.options
        : undefined

    return {
      MDListItem(node) {
        /* istanbul ignore if -- POC only covers unordered lists */
        if (node.parent?.type !== 'MDList' || node.parent.ordered) {
          return
        }

        const [start] = node.range
        const actual = sourceText.charAt(start) as Marker

        /* istanbul ignore if -- mdast list items start with a marker */
        if (actual !== '*' && actual !== '+' && actual !== '-') {
          return
        }

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected unordered list marker \`${actual}\`, expected \`${expected}\``,
          fix: fixer => fixer.replaceTextRange([start, start + 1], expected),
        })
      },
    }
  },
}
