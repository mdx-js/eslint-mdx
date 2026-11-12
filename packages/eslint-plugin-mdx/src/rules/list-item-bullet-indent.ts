import type { Rule } from 'eslint'
import type { Program } from 'estree'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-bullet-indent': never
  }
}

export const listItemBulletIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Disallow indented list bullets' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-bullet-indent')
    if (!config) {
      return {}
    }
    return {
      Program(node: Program) {
        for (const child of node.body) {
          if (child.type !== 'MDList') {
            continue
          }

          for (const item of child.children) {
            const actual = item.loc.start.column

            if (actual > 0) {
              context.report({
                loc: item.loc,
                message: `Unexpected \`${actual}\` ${actual === 1 ? 'space' : 'spaces'} before list item, expected \`0\` spaces, remove them`,
              })
            }
          }
        }
      },
    }
  },
}
