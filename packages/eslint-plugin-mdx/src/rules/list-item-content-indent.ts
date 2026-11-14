import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-content-indent': never
  }
}

type LocatedChild = MDListItem['children'][number] & {
  loc: NonNullable<MDListItem['children'][number]['loc']>
}

export const listItemContentIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item content indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'list-item-content-indent')

    if (!config) {
      return {}
    }

    return {
      MDListItem(node: MDListItem) {
        const children = node.children.filter(
          (child): child is LocatedChild => child.loc != null,
        )
        const [first] = children

        if (!first) {
          return
        }

        const expected = first.loc.start.column

        for (const child of children.slice(1)) {
          const actual = child.loc.start.column

          if (actual !== expected) {
            const difference = expected - actual

            context.report({
              loc: child.loc,
              message: `Unexpected unaligned list item child, expected to align with first child, ${difference > 0 ? 'add' : 'remove'} \`${Math.abs(difference)}\` spaces`,
            })
          }
        }
      },
    }
  },
}
