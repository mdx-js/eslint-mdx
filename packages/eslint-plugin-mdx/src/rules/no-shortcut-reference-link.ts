import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-shortcut-reference-link': never
  }
}

export const noShortcutReferenceLink: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow shortcut reference links',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-shortcut-reference-link',
    )

    if (!config) {
      return {}
    }

    return {
      MDLinkReference(node) {
        if (node.referenceType === 'shortcut') {
          context.report({
            loc: node.loc,
            message:
              'Unexpected shortcut reference link (`[text]`), expected collapsed reference (`[text][]`)',
          })
        }
      },
    }
  },
}
