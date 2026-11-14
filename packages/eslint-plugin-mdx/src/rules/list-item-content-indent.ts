import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-content-indent': never
  }
}

const pluralize = (count: number) => (count === 1 ? 'space' : 'spaces')

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

    const sourceText = context.sourceCode.getText()

    return {
      MDListItem(node: MDListItem) {
        const children = node.children.filter(child => child.loc)
        const [first] = children

        if (!first?.loc) {
          return
        }

        let expected = first.loc.start.column

        if (typeof node.checked === 'boolean') {
          const checkboxStart = sourceText.lastIndexOf('[', first.range[0] - 1)

          expected -= first.range[0] - checkboxStart
        }

        for (const child of children.slice(1)) {
          const actual = child.loc.start.column

          if (actual !== expected) {
            const difference = expected - actual

            context.report({
              loc: child.loc,
              message: `Unexpected unaligned list item child, expected to align with first child, ${difference > 0 ? 'add' : 'remove'} \`${Math.abs(difference)}\` ${pluralize(Math.abs(difference))}`,
            })
          }
        }
      },
    }
  },
}
