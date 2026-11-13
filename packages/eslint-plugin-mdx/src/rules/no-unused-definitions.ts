import type { Rule } from 'eslint'
import type {
  MDDefinition,
  MDFootnoteDefinition,
  MDFootnoteReference,
  MDImageReference,
  MDLinkReference,
} from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-unused-definitions': never
  }
}

type DefinitionNode = MDDefinition | MDFootnoteDefinition

interface DefinitionEntry {
  identifier: string
  node: DefinitionNode
}

export const noUnusedDefinitions: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused definitions',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-unused-definitions')

    if (!config) {
      return {}
    }

    const definitions = new Map<string, DefinitionEntry>()
    const used = new Set<string>()

    const markUsed = (identifier: string) => {
      used.add(identifier)
    }

    return {
      MDDefinition(node: MDDefinition) {
        definitions.set(node.identifier, {
          identifier: node.identifier,
          node,
        })
      },
      MDFootnoteDefinition(node: MDFootnoteDefinition) {
        definitions.set(node.identifier, {
          identifier: node.identifier,
          node,
        })
      },
      MDImageReference(node: MDImageReference) {
        markUsed(node.identifier)
      },
      MDLinkReference(node: MDLinkReference) {
        markUsed(node.identifier)
      },
      MDFootnoteReference(node: MDFootnoteReference) {
        markUsed(node.identifier)
      },
      'Program:exit'() {
        for (const { identifier, node } of definitions.values()) {
          if (used.has(identifier)) {
            continue
          }

          const prefix = node.type === 'MDFootnoteDefinition' ? 'footnote ' : ''

          context.report({
            loc: node.loc,
            message: `Unexpected unused ${prefix}definition, expected no definition or one or more ${prefix}references to \`${identifier}\``,
          })
        }
      },
    }
  },
}
