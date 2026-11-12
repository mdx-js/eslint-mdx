import type { Rule } from 'eslint'
import type { MDCode } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'fenced-code-flag':
      | readonly string[]
      | { allowEmpty?: boolean; flags?: readonly string[] }
      | undefined
  }
}

const fence = /^ {0,3}([~`])\1{2,}/u

export const fencedCodeFlag: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Require fenced code language flags' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'fenced-code-flag')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    const options = config.options
    let allowEmpty = false
    let flags: readonly string[] | undefined

    if (Array.isArray(options)) {
      /* istanbul ignore next -- POC covers array options via remark config */
      flags = options as readonly string[]
    } else if (options && typeof options === 'object') {
      const settings = options as {
        allowEmpty?: boolean
        flags?: readonly string[]
      }
      allowEmpty = settings.allowEmpty === true
      flags = settings.flags
    }

    return {
      MDCode(node: MDCode) {
        const raw = sourceText.slice(node.range[0], node.range[1])

        if (!fence.test(raw)) {
          return
        }

        if (!node.lang) {
          if (!allowEmpty) {
            context.report({
              loc: node.loc,
              message:
                'Unexpected missing fenced code language flag in info string, expected keyword',
            })
          }

          return
        }

        if (flags && !flags.includes(node.lang)) {
          const expected = flags.map(flag => `\`${flag}\``).join(', ')

          context.report({
            loc: node.loc,
            message: `Unexpected fenced code language flag \`${node.lang}\` in info string, expected ${expected}`,
          })
        }
      },
    }
  },
}
