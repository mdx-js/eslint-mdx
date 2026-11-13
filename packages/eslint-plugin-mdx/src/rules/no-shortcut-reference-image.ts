import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-shortcut-reference-image': never
  }
}

export const noShortcutReferenceImage: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow shortcut reference images',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-shortcut-reference-image')

    if (!config) {
      return {}
    }

    return {
      MDImageReference(node) {
        if (node.referenceType === 'shortcut') {
          context.report({
            loc: node.loc,
            message:
              'Unexpected shortcut reference image (`![text]`), expected collapsed reference (`![text][]`)',
          })
        }
      },
    }
  },
}
