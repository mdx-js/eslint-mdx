import type { Rule } from 'eslint'
import type { MDText } from 'eslint-mdx'

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

    const sourceText = context.sourceCode.getText()
    const definitions = new Set<string>()
    const references: Array<{ identifier: string; loc: MDText['loc'] }> = []

    return {
      MDDefinition(node) {
        definitions.add(node.identifier)
      },
      MDFootnoteDefinition(node) {
        definitions.add(node.identifier)
      },
      MDText(node: MDText) {
        const value = sourceText.slice(node.range[0], node.range[1])

        // eslint-disable-next-line sonarjs/super-linear-regex -- short inline references
        for (const match of value.matchAll(/\[[^\]]*\]\[([^\]]+)\]/gu)) {
          references.push({
            identifier: match[1],
            loc: node.loc,
          })
        }
      },
      'Program:exit'() {
        for (const { identifier, loc } of references) {
          /* istanbul ignore if -- POC covers defined references */
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
