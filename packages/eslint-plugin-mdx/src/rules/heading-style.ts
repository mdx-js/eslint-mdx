import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'heading-style': 'atx-closed' | 'atx' | 'consistent' | 'setext' | undefined
  }
}

type Style = 'atx-closed' | 'atx' | 'setext'

const styleName = (style: Style) => {
  switch (style) {
    case 'setext': {
      return 'setext'
    }
    case 'atx-closed': {
      return 'ATX (closed)'
    }
    default: {
      return 'ATX'
    }
  }
}

export const headingStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a heading style',
    },
    schema: [
      { enum: ['atx-closed', 'atx', 'consistent', 'setext'], type: 'string' },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'heading-style')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let expected: Style | undefined =
      config.options === 'atx' ||
      config.options === 'atx-closed' ||
      config.options === 'setext'
        ? config.options
        : undefined

    return {
      MDHeading(node: MDHeading) {
        const raw = sourceText.slice(node.range[0], node.range[1]).trimEnd()
        let actual: Style = 'setext'

        if (raw.startsWith('#')) {
          actual = /\s#\s*$/u.test(raw) ? 'atx-closed' : 'atx'
        }

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected ${styleName(actual)} heading, expected ${styleName(expected)}`,
        })
      },
    }
  },
}
