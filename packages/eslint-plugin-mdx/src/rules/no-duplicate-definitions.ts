import type { Rule } from 'eslint'
import type { MDDefinition, MDFootnoteDefinition } from 'eslint-mdx'

import { ENABLED_OPTION_SCHEMA, getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-duplicate-definitions': never
  }
}

export const noDuplicateDefinitions: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate definitions',
    },
    schema: [ENABLED_OPTION_SCHEMA],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-duplicate-definitions')

    if (!config) {
      return {}
    }

    const definitions = new Set<string>()
    const footnoteDefinitions = new Set<string>()

    const check = (node: MDDefinition | MDFootnoteDefinition, footnote: boolean) => {
      const identifiers = footnote ? footnoteDefinitions : definitions

      if (identifiers.has(node.identifier)) {
        const prefix = footnote ? 'footnote ' : ''

        context.report({
          loc: node.loc,
          message: `Unexpected ${prefix}definition with an already defined identifier (\`${node.identifier}\`), expected unique identifiers`,
        })
      }

      identifiers.add(node.identifier)
    }

    return {
      MDDefinition(node) {
        check(node, false)
      },
      MDFootnoteDefinition(node) {
        check(node, true)
      },
    }
  },
}
