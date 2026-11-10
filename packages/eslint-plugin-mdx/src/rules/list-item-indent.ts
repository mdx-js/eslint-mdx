/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-indent': 'mixed' | 'space' | 'tab' | undefined
  }
}

export const listItemIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-indent')
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    return {
      MDListItem(node: MDListItem) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        const marker = /^\s*(?:[-*+]|\d+[.)])\s/u.exec(raw)
        if (!marker) {
          return
        }
        const expected = marker[0].length
        for (const [index, line] of raw.split('\n').entries()) {
          if (index === 0 || !line.trim()) {
            continue
          }
          const actual = /^\s*/u.exec(line)?.[0].length ?? 0
          if (actual !== expected) {
            context.report({
              loc: node.loc,
              message: `Unexpected \`${actual}\` spaces for list item indent, expected \`${expected}\``,
            })
            break
          }
        }
      },
    }
  },
}
