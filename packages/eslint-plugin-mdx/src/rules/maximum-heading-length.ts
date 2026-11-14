import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'
import type { JSXElement } from 'estree-jsx'

import { ANY_OPTION_SCHEMA, getNodeText, getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'maximum-heading-length':
      number | { size?: number | null; stringLength?: unknown } | undefined
  }
}

export const maximumHeadingLength: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a maximum heading length',
    },
    schema: [
      {
        anyOf: [
          { type: 'number' },
          {
            additionalProperties: false,
            properties: {
              size: { type: ['number', 'null'] },
              stringLength: ANY_OPTION_SCHEMA,
            },
            type: 'object',
          },
        ],
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'maximum-heading-length')

    if (!config) {
      return {}
    }

    const size =
      typeof config.options === 'object' ? config.options.size : config.options
    const expected = typeof size === 'number' ? size : 60

    const report = (node: JSXElement | MDHeading) => {
      const actual = [...getNodeText(node)].length

      if (actual > expected) {
        context.report({
          loc: node.loc,
          message: `Unexpected \`${actual}\` characters in heading, expected at most \`${expected}\` characters`,
        })
      }
    }

    return {
      MDHeading(node: MDHeading) {
        report(node)
      },
      JSXElement(node: JSXElement) {
        const name = node.openingElement.name

        if (name.type !== 'JSXIdentifier' || !/^h[1-6]$/u.test(name.name)) {
          return
        }

        report(node)
      },
    }
  },
}
