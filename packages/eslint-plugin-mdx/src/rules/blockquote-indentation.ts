import type { Rule } from 'eslint'
import type { MDBlockquote } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'blockquote-indentation': number | string | undefined
  }
}

const pluralize = (count: number) => (count === 1 ? 'space' : 'spaces')

export const blockquoteIndentation: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce blockquote indentation' },
    schema: [{ type: ['number', 'string'] }],
  },
  create(context) {
    const config = getRuleConfig(context, 'blockquote-indentation')

    if (!config) {
      return {}
    }

    let expected =
      typeof config.options === 'number' ? config.options : undefined

    return {
      MDBlockquote(node: MDBlockquote) {
        const [child] = node.children

        if (!child) {
          return
        }

        const actual = child.loc.start.column - node.loc.start.column
        expected ??= actual

        if (actual !== expected) {
          const difference = expected - actual

          context.report({
            loc: child.loc,
            message: `Unexpected \`${actual}\` ${pluralize(actual)} between block quote marker and content, expected \`${expected}\` ${pluralize(expected)}, ${difference > 0 ? 'add' : 'remove'} \`${Math.abs(difference)}\` ${pluralize(Math.abs(difference))}`,
          })
        }
      },
    }
  },
}
