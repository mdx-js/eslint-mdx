/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'final-definition': never
  }
}

export const finalDefinition: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Require definitions at the end' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'final-definition')
    if (!config) {
      return {}
    }
    return {
      Program() {
        const body = context.sourceCode.ast.body
        const definition = body.find(
          node =>
            node.type === 'MDDefinition' ||
            node.type === 'MDFootnoteDefinition',
        )
        const index = definition ? body.indexOf(definition) : -1
        if (
          definition &&
          body
            .slice(index + 1)
            .some(
              node =>
                node.type !== 'MDDefinition' &&
                node.type !== 'MDFootnoteDefinition',
            )
        ) {
          context.report({
            loc: definition.loc ?? undefined,
            message:
              'Unexpected definition before last content, expected definitions after last content',
          })
        }
      },
    }
  },
}
