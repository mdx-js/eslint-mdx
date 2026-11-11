import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'ordered-list-marker-style': '.' | ')' | 'consistent' | undefined
  }
}

type Marker = '.' | ')'

export const orderedListMarkerStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent ordered list marker style',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'ordered-list-marker-style',
    )

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the explicit marker option */
    let expected: Marker | undefined =
      config.options === '.' || config.options === ')'
        ? config.options
        : undefined

    return {
      MDListItem(node: MDListItem) {
        const parent = (
          node as MDListItem & {
            parent?: { ordered?: boolean; type: string }
          }
        ).parent

        /* istanbul ignore if -- POC covers ordered lists */
        if (parent?.type !== 'MDList' || !parent.ordered) {
          return
        }

        const start = node.range[0]
        const raw = sourceText.slice(start, node.range[1])
        const match = /^\d+([.)])/u.exec(raw)

        /* istanbul ignore if -- list items have markers */
        if (!match) {
          return
        }

        const actual = match[1] as Marker

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected ordered list marker \`${actual}\`, expected \`${expected}\``,
          fix: fixer =>
            fixer.replaceTextRange(
              [start + match[0].length - 1, start + match[0].length],
              expected,
            ),
        })
      },
    }
  },
}
