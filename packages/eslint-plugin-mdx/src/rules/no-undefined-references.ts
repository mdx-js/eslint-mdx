/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type {
  MDFootnoteReference,
  MDImageReference,
  MDLinkReference,
} from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-undefined-references': never
  }
}

export const noUndefinedReferences: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow undefined references' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-undefined-references')
    if (!config) {
      return {}
    }
    const definitions = new Set<string>()
    const references: Array<{
      identifier: string
      loc: MDFootnoteReference['loc']
    }> = []
    return {
      MDDefinition(node) {
        definitions.add(node.identifier)
      },
      MDFootnoteDefinition(node) {
        definitions.add(node.identifier)
      },
      MDImageReference(node: MDImageReference) {
        references.push({ identifier: node.identifier, loc: node.loc })
      },
      MDLinkReference(node: MDLinkReference) {
        references.push({ identifier: node.identifier, loc: node.loc })
      },
      MDFootnoteReference(node: MDFootnoteReference) {
        references.push({ identifier: node.identifier, loc: node.loc })
      },
      'Program:exit'() {
        for (const { identifier, loc } of references) {
          if (!definitions.has(identifier)) {
            context.report({
              loc,
              message: `Unexpected reference to undefined definition \`${identifier}\``,
            })
          }
        }
      },
    }
  },
}
