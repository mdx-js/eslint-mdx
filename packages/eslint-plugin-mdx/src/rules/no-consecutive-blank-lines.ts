import type { Rule } from 'eslint'
import type { MDBlockquote, MDList, MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-consecutive-blank-lines': never
  }
}

interface Positioned {
  loc?: {
    end: { column: number; line: number }
    start: { column: number; line: number }
  }
}

export const noConsecutiveBlankLines: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow consecutive blank lines',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-consecutive-blank-lines',
    )

    if (!config) {
      return {}
    }

    const check = (children: Positioned[]) => {
      for (let index = 1; index < children.length; index++) {
        const previous = children[index - 1]
        const current = children[index]

        /* istanbul ignore if -- AST nodes have locations */
        if (!previous.loc || !current.loc) {
          continue
        }

        // `2` for the line ending after the previous node and the line
        // ending of the blank line itself.
        const difference = current.loc.start.line - previous.loc.end.line - 2

        if (difference > 0) {
          const actual = difference + 1

          context.report({
            loc: current.loc,
            message: `Unexpected \`${actual}\` blank lines before node, expected up to \`1\` blank line, remove \`${difference}\` blank line`,
          })
        }
      }
    }

    return {
      Program(node) {
        check(node.body)
      },
      MDBlockquote(node: MDBlockquote) {
        check(node.children)
      },
      MDList(node: MDList) {
        check(node.children)
      },
      MDListItem(node: MDListItem) {
        check(node.children)
      },
    }
  },
}
