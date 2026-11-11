import type { Rule } from 'eslint'
import type { MDBlockquote } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-blockquote-without-marker': never
  }
}

export const noBlockquoteWithoutMarker: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow blockquotes without markers' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-blockquote-without-marker',
    )

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      MDBlockquote(node: MDBlockquote) {
        const lines = sourceText.slice(node.range[0], node.range[1]).split('\n')

        for (const [index, line] of lines.entries()) {
          if (index === 0 || !line.trim()) {
            continue
          }

          let actual = 0

          for (const char of line) {
            if (char === '>') {
              actual++
            } else if (char !== ' ' && char !== '\t') {
              break
            }
          }

          const expected = 1

          if (actual !== expected) {
            const difference = expected - actual

            context.report({
              loc: {
                start: {
                  line: node.loc.start.line + index,
                  column: 0,
                },
                end: {
                  line: node.loc.start.line + index,
                  column: line.length,
                },
              },
              message: `Unexpected \`${actual}\` block quote marker before paragraph line, expected \`${expected}\` marker, add \`${difference}\` marker`,
            })
          }
        }
      },
    }
  },
}
