import type { Rule } from 'eslint'
import type { MDList } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-spacing': { checkBlanks?: boolean } | undefined
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

    return {
      MDList(node: MDList) {
        const spaced = node.children.some(item => {
          /* istanbul ignore if -- POC covers item spread */
          if (config.options?.checkBlanks) {
            return item.spread
          }

          const tail = item.children.at(-1)

          return !!tail?.loc && tail.loc.end.line - item.loc.start.line > 0
        })
        const expected = spaced ? 1 : 0
        let previous: (typeof node.children)[number] | undefined

        for (const item of node.children) {
          if (previous?.loc) {
            const actual = item.loc.start.line - previous.loc.end.line - 1

            if (actual !== expected) {
              const difference = expected - actual

              context.report({
                loc: item.loc,
                message: `Unexpected \`${actual}\` blank lines between list items, expected \`${expected}\` blank lines, ${difference > 0 ? 'add' : 'remove'} \`${Math.abs(difference)}\` blank lines`,
              })
            }
          }

          previous = item
        }
      },
    }
  },
}
