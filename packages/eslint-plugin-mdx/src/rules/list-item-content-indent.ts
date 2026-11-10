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
    const sourceText = context.sourceCode.getText()
    return {
      MDListItem(node: MDListItem) {
        const lines = sourceText.slice(node.range[0], node.range[1]).split('\n')
        /* istanbul ignore next -- list items have lines */
        const first = lines[0] ?? ''
        const marker = /^\s*(?:[-*+]|\d+[.)])\s+/u.exec(first)
        /* istanbul ignore if -- list items have markers */
        if (!marker) {
          return
        }
        const expected = marker[0].length
        for (const [index, line] of lines.entries()) {
          if (index === 0 || !line.trim()) {
            continue
          }
          /* istanbul ignore next -- regex always matches */
          const actual = /^\s*/u.exec(line)?.[0].length ?? 0
          if (actual !== expected) {
            context.report({
              loc: node.loc,
              message: `Unexpected unaligned list item child, expected to align with first child, ${actual < expected ? 'add' : 'remove'} \`${Math.abs(expected - actual)}\` spaces`,
            })
            break
          }
        }
      },
    }
  },
}
