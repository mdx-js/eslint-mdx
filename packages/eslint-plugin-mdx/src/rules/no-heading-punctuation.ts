import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-heading-punctuation': RegExp | string | undefined
  }
}

export const noHeadingPunctuation: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow punctuation at the end of headings',
    },
    schema: [{ type: ['string', 'object'] }],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-heading-punctuation')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the default option */
    /* eslint-disable sonarjs/no-nested-conditional */
    const expected =
      config.options == null
        ? /[!,.:;?]/u
        : typeof config.options === 'string'
          ? new RegExp(`[${config.options}]`, 'u')
          : config.options
    /* eslint-enable sonarjs/no-nested-conditional */

    return {
      MDHeading(node) {
        const text = sourceText
          .slice(node.range[0], node.range[1])
          .replace(/^\s*#{1,6}\s*/u, '')
          .trim()
        const tail = [...text].at(-1)

        if (tail && expected.test(tail)) {
          context.report({
            loc: node.loc,
            message: `Unexpected character \`${tail}\` at end of heading, remove it`,
          })
        }
      },
    }
  },
}
