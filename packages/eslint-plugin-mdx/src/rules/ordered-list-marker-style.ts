import type { Rule } from 'eslint'
import type { MDList, MDListItem } from 'eslint-mdx'

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
    schema: [{ enum: ['.', ')', 'consistent'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'ordered-list-marker-style')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let expected: Marker | undefined =
      config.options === '.' || config.options === ')'
        ? config.options
        : undefined

    const checkItem = (item: MDListItem) => {
      const start = item.range[0]
      const raw = sourceText.slice(start, item.range[1])
      const match = /^\d+([.)])/u.exec(raw)

      const actual = match[1] as Marker

      expected ??= actual

      if (actual === expected) {
        return
      }

      const markerIndex = start + match[0].length - 1
      const markerStart = context.sourceCode.getLocFromIndex(markerIndex)

      context.report({
        loc: { start: markerStart, end: markerStart },
        message: `Unexpected ordered list marker \`${actual}\`, expected \`${expected}\``,
        fix: fixer =>
          fixer.replaceTextRange([markerIndex, markerIndex + 1], expected),
      })
    }

    return {
      MDList(list: MDList) {
        if (!list.ordered) {
          return
        }

        for (const item of list.children) {
          checkItem(item)
        }
      },
    }
  },
}
