import type { Rule } from 'eslint'
import type { MDCode } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'fenced-code-marker': '`' | '~' | 'consistent' | undefined
  }
}

type Marker = '`' | '~'

const markerText = (marker: Marker) => (marker === '`' ? '`` ` ``' : '`~`')

export const fencedCodeMarker: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent fenced code marker',
    },
    schema: [{ enum: ['`', '~', 'consistent'], type: 'string' }],
  },
  create(context) {
    const config = getRuleConfig(context, 'fenced-code-marker')

    if (!config) {
      return {}
    }

    let expected: Marker | undefined =
      config.options === '`' || config.options === '~'
        ? config.options
        : undefined

    return {
      MDCode(node: MDCode) {
        const raw = node.raw
        let actual: Marker | undefined

        if (raw.startsWith('```')) {
          actual = '`'
        } else if (raw.startsWith('~~~')) {
          actual = '~'
        }

        if (!actual) {
          return
        }

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected fenced code marker ${markerText(actual)}, expected ${markerText(expected)}`,
        })
      },
    }
  },
}
