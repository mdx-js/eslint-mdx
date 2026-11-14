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

const consolidate = (
  depth: number,
  relative: Style | undefined,
): Style | undefined => {
  if (depth < 3) {
    return 'atx'
  }

  if (relative === 'atx' || relative === 'setext') {
    return relative
  }
}

const getHeadingStyle = (
  node: MDHeading,
  relative?: Style,
): Style | undefined => {
  const position = node.loc.end
  const last = node.children.at(-1)
  const final = last?.loc?.end
  const { depth } = node

  if (!last) {
    if (position.column <= depth * 2) {
      return consolidate(depth, relative)
    }

    return 'atx-closed'
  }

  if (final && final.line + 1 === position.line) {
    return 'setext'
  }

  if (final && final.column + depth < position.column) {
    return 'atx-closed'
  }

  return consolidate(depth, relative)
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

    let expected: Style | undefined =
      config.options === 'atx' ||
      config.options === 'atx-closed' ||
      config.options === 'setext'
        ? config.options
        : undefined

    return {
      MDHeading(node: MDHeading) {
        const actual = getHeadingStyle(node, expected)

        if (!actual) {
          return
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
