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
    const config = getRuleConfig(context, 'blockquote-indentation')

    if (!config) {
      return {}
    }

    /* istanbul ignore next -- POC config sets indentation */
    let expected =
      typeof config.options === 'number' ? config.options : undefined

    return {
      MDBlockquote(node: MDBlockquote) {
        const [child] = node.children

        /* istanbul ignore if -- blockquotes have children */
        if (!child) {
          return
        }

        const actual = child.loc.start.column - node.loc.start.column
        expected ??= actual

        if (actual !== expected) {
          context.report({
            loc: child.loc,
            message: `Unexpected \`${actual}\` spaces between block quote marker and content, expected \`${expected}\``,
          })
        }
      },
    }
  },
}
