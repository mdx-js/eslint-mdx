import type { Rule } from 'eslint'
import type { MDBlockquote, MDList, MDListItem } from 'eslint-mdx'
import type { BaseNode } from 'estree'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-consecutive-blank-lines': never
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
    const config = getRuleConfig(context, 'no-consecutive-blank-lines')

    if (!config) {
      return {}
    }

    const check = (children: readonly BaseNode[]) => {
      let previousLoc: BaseNode['loc']

      for (const current of children) {
        const currentLoc = current.loc

        // `2` for the line ending after the previous node and the line
        // ending of the blank line itself.
        const difference = previousLoc
          ? currentLoc.start.line - previousLoc.end.line - 2
          : 0

        if (difference > 0) {
          const actual = difference + 1

          context.report({
            loc: currentLoc,
            message: `Unexpected \`${actual}\` blank lines before node, expected up to \`1\` blank line, remove \`${difference}\` blank line`,
          })
        }

        previousLoc = currentLoc
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
