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
const listFormat = new Intl.ListFormat('en', { type: 'disjunction' })
const unitFormat = new Intl.ListFormat('en', { type: 'unit' })

const formatFlags = (flags: readonly string[]) => {
  const quoted = flags.map(flag => `\`${flag}\``)

  return flags.length > 3
    ? unitFormat.format([...quoted.slice(0, 3), '…'])
    : listFormat.format(quoted)
}

export const fencedCodeFlag: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce fenced code language flags' },
    schema: [
      {
        anyOf: [
          { items: { type: 'string' }, type: 'array' },
          {
            additionalProperties: false,
            properties: {
              allowEmpty: { type: 'boolean' },
              flags: { items: { type: 'string' }, type: 'array' },
            },
            type: 'object',
          },
        ],
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'fenced-code-flag')

    if (!config) {
      return {}
    }

    const options = config.options
    let allowEmpty = false
    let flags: readonly string[] | undefined

    if (Array.isArray(options)) {
      flags = options as readonly string[]
    } else if (options && typeof options === 'object') {
      const settings = options as {
        allowEmpty?: boolean
        flags?: readonly string[]
      }
      allowEmpty = settings.allowEmpty === true
      flags = settings.flags
    }

    const expected = flags ? formatFlags(flags) : 'keyword'

    return {
      MDCode(node: MDCode) {
        const raw = node.raw

        if (!fence.test(raw)) {
          return
        }

        if (!node.lang) {
          if (!allowEmpty) {
            context.report({
              loc: node.loc,
              message: `Unexpected missing fenced code language flag in info string, expected ${expected}`,
            })
          }

          return
        }

        if (flags && !flags.includes(node.lang)) {
          context.report({
            loc: node.loc,
            message: `Unexpected fenced code language flag \`${node.lang}\` in info string, expected ${expected}`,
          })
        }
      },
    }
  },
}
