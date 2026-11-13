import type { Rule } from 'eslint'
import type { MDList } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-spacing': { checkBlanks?: boolean } | undefined
  }
}

const pluralize = (count: number) => (count === 1 ? 'line' : 'lines')

export const listItemSpacing: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item spacing' },
    schema: [
      {
        additionalProperties: false,
        properties: { checkBlanks: { type: 'boolean' } },
        type: 'object',
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'list-item-spacing')

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
              const direction = difference > 0 ? 'add' : 'remove'
              const differenceAbsolute = Math.abs(difference)

              context.report({
                loc: { start: previous.loc.end, end: item.loc.start },
                message: `Unexpected \`${actual}\` blank ${pluralize(actual)} between list items, expected \`${expected}\` blank ${pluralize(expected)}, ${direction} \`${differenceAbsolute}\` blank ${pluralize(differenceAbsolute)}`,
              })
            }
          }

          previous = item
        }
      },
    }
  },
}
