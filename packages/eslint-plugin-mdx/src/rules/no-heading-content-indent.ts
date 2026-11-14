import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-heading-content-indent': never
  }
}

export const noHeadingContentIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce one space between heading markers and content',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-heading-content-indent')

    if (!config) {
      return {}
    }

    return {
      MDHeading(node: MDHeading) {
        const spaceMatch = /^(#+)([ \t]+)/u.exec(node.raw)

        if (!spaceMatch) {
          return
        }

        const size = spaceMatch[2].length

        if (size <= 1) {
          return
        }

        const start = node.range[0] + spaceMatch[1].length

        context.report({
          loc: {
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + start - node.range[0],
            },
            end: {
              line: node.loc.start.line,
              column: node.loc.start.column + start - node.range[0] + size,
            },
          },
          message: `Unexpected \`${size}\` spaces between hashes and content, expected \`1\` space, remove \`${size - 1}\` spaces`,
          fix: fixer => fixer.replaceTextRange([start, start + size], ' '),
        })
      },
    }
  },
}
