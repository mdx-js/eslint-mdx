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
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'fenced-code-marker')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the explicit marker option */
    let expected: Marker | undefined =
      config.options === '`' || config.options === '~'
        ? config.options
        : undefined

    return {
      MDCode(node: MDCode) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        let actual: Marker | undefined

        /* istanbul ignore next -- POC covers both fence kinds */
        if (raw.startsWith('```')) {
          actual = '`'
        } else if (raw.startsWith('~~~')) {
          actual = '~'
        }

        /* istanbul ignore if -- indented code has no fence */
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
