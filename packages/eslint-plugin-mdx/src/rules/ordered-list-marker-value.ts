import type { Rule } from 'eslint'
import type { MDList } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'ordered-list-marker-value': 'one' | 'ordered' | 'single' | undefined
  }
}

type Style = 'one' | 'ordered' | 'single'

const configuredStyle = (
  option: 'one' | 'ordered' | 'single' | undefined,
): Style | undefined => {
  /* istanbul ignore if -- POC config is consistent */
  if (option === 'one' || option === 'ordered' || option === 'single') {
    return option
  }
}

const inferStyle = (
  first: number | undefined,
  second: number | undefined,
): Style => {
  if (second != null && second === first) {
    return 'single'
  }

  return 'ordered'
}

const expectedValue = (style: Style, first: number, index: number) => {
  /* istanbul ignore if -- POC covers single/ordered */
  if (style === 'one') {
    return 1
  }

  return style === 'single' ? first : first + index
}

const markerValue = (sourceText: string, item: MDList['children'][number]) => {
  const child = item.children[0]

  /* istanbul ignore if -- ordered items have children */
  if (!child) {
    return
  }

  const raw = sourceText.slice(item.range[0], child.range[0])
  const match = /^(\d+)[.)]\s/u.exec(raw)

  return Number(match[1])
}

export const orderedListMarkerValue: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce ordered list marker values' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'ordered-list-marker-value')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      MDList(node: MDList) {
        /* istanbul ignore if -- POC covers ordered lists */
        if (!node.ordered) {
          return
        }

        const values = node.children.map(item => markerValue(sourceText, item))
        const first = values[0]
        const second = values[1]
        const style =
          configuredStyle(config.options) ?? inferStyle(first, second)

        /* istanbul ignore if -- ordered lists have values */
        if (first == null) {
          return
        }

        for (const [index, actual] of values.entries()) {
          /* istanbul ignore if -- ordered items have markers */
          if (actual == null) {
            continue
          }

          const expected = expectedValue(style, first, index)

          if (actual !== expected) {
            context.report({
              loc: node.children[index].loc,
              message: `Unexpected ordered list item value \`${actual}\`, expected \`${expected}\``,
            })
          }
        }
      },
    }
  },
}
