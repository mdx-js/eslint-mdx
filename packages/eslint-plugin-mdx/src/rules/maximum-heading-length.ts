import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

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
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'maximum-heading-length')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the numeric size option */
    const size =
      typeof config.options === 'object' && config.options !== null
        ? config.options.size
        : config.options
    const expected = typeof size === 'number' ? size : 60

    return {
      MDHeading(node) {
        const text = sourceText
          .slice(node.range[0], node.range[1])
          .replace(/^\s*#{1,6}\s*/u, '')
          .trim()
        const actual = [...text].length

        if (actual > expected) {
          context.report({
            loc: node.loc,
            message: `Unexpected \`${actual}\` characters in heading, expected at most \`${expected}\` characters`,
          })
        }
      },
    }
  },
}
