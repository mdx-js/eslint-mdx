import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-content-indent': never
  }
}

export const listItemContentIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item content indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-content-indent')

    if (!config) {
      return {}
    }

    return {
      MDListItem(node: MDListItem) {
        const children = node.children.filter(child => child.loc)
        const [first] = children

        /* istanbul ignore if -- list items have children */
        if (!first?.loc) {
          return
        }

        const expected = first.loc.start.column

        for (const child of children.slice(1)) {
          /* istanbul ignore if -- AST children have locations */
          if (!child.loc) {
            continue
          }

          const actual = child.loc.start.column

          if (actual !== expected) {
            const difference = expected - actual

            context.report({
              loc: child.loc,
              message: `Unexpected unaligned list item child, expected to align with first child, ${['remove', 'remove', 'add'][Math.sign(difference) + 1]} \`${Math.abs(difference)}\` spaces`,
            })
          }
        }
      },
    }
  },
}
