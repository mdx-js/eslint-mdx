import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-bullet-indent': never
  }
}

export const listItemBulletIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Disallow indented list bullets' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-bullet-indent')
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    return {
      MDListItem(node: MDListItem) {
        const indent = node.loc.start.column
        if (indent > 0) {
          context.report({
            loc: node.loc,
            message: `Unexpected \`${indent}\` spaces before list item, remove \`${indent}\` spaces`,
          })
        }
      },
    }
  },
}
