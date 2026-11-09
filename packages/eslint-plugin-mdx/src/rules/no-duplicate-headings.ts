import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-duplicate-headings': never
  }
}

export const noDuplicateHeadings: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate headings',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-duplicate-headings')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    const headings = new Set<string>()

    return {
      MDHeading(node) {
        const text = sourceText
          .slice(node.range[0], node.range[1])
          .replace(/^\s*#{1,6}\s*/u, '')
          .trim()
          .toLowerCase()

        if (headings.has(text)) {
          context.report({
            loc: node.loc,
            message:
              'Unexpected heading with equivalent text, expected unique headings',
          })
        }

        headings.add(text)
      },
    }
  },
}
