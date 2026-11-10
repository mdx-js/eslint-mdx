/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDBlockquote } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'blockquote-indentation': number | string | undefined
  }
}

export const blockquoteIndentation: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce blockquote indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'blockquote-indentation')
    if (!config) {
      return {}
    }
    const expected = typeof config.options === 'number' ? config.options : 2
    const sourceText = context.sourceCode.getText()
    return {
      MDBlockquote(node: MDBlockquote) {
        const lines = sourceText.slice(node.range[0], node.range[1]).split('\n')
        for (const [index, line] of lines.entries()) {
          const match = /^>\s*/u.exec(line)
          if (!match) {
            continue
          }
          const actual = match[0].length - 1
          if (actual !== expected) {
            context.report({
              loc: {
                start: { line: node.loc.start.line + index, column: 0 },
                end: { line: node.loc.start.line + index, column: 0 },
              },
              message: `Unexpected \`${actual}\` spaces before blockquote content, expected \`${expected}\``,
            })
          }
        }
      },
    }
  },
}
