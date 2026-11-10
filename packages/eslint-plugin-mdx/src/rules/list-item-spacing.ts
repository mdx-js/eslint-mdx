/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDList } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-spacing': never
  }
}

export const listItemSpacing: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item spacing' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-spacing')
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    return {
      MDList(node: MDList) {
        const lines = sourceText.slice(node.range[0], node.range[1]).split('\n')

        if (
          lines.some(
            (line, index) =>
              !line.trim() &&
              /^(?:[-*+]|\d+[.)])\s/u.test(
                (lines[index + 1] ?? '').trimStart(),
              ),
          )
        ) {
          context.report({
            loc: node.loc,
            message:
              'Unexpected blank line between list items, expected no blank lines',
          })
        }
      },
    }
  },
}
