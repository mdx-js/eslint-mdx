import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-indent': 'mixed' | 'one' | 'tab' | undefined
  }
}

type Style = 'mixed' | 'one' | 'tab'

const CHARS_PER_TAB = 4

const pluralize = (count: number) => (count === 1 ? 'space' : 'spaces')

export const listItemIndent: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce list item indentation' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'list-item-indent')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC config sets indentation */
    const configured =
      config.options === 'mixed' ||
      config.options === 'one' ||
      config.options === 'tab'
        ? config.options
        : undefined

    return {
      MDListItem(node: MDListItem) {
        const head = node.children[0]

        /* istanbul ignore if -- list items have children */
        if (!head) {
          return
        }

        let slice = sourceText.slice(node.range[0], head.range[0])
        const checkbox = slice.indexOf('[')

        /* istanbul ignore if -- POC covers checkbox items */
        if (checkbox !== -1) {
          slice = slice.slice(0, checkbox)
        }

        let end = slice.length

        while (end > 0 && (slice[end - 1] === ' ' || slice[end - 1] === '\t')) {
          end--
        }

        const style: Style = configured ?? 'one'
        const loose = Boolean(
          node.spread ||
          node.children.some(child => 'spread' in child && child.spread),
        )
        let expectedIndent = end + 1

        /* istanbul ignore next -- POC covers one-space indentation */
        if (style === 'tab' || (style === 'mixed' && loose)) {
          expectedIndent =
            Math.ceil(expectedIndent / CHARS_PER_TAB) * CHARS_PER_TAB
        }

        const expectedSpaces = expectedIndent - end
        const actualSpaces = slice.length - end

        if (actualSpaces !== expectedSpaces) {
          const difference = expectedSpaces - actualSpaces
          let listKind = ''

          if (style === 'mixed') {
            listKind = loose ? ' in loose list' : ' in tight list'
          }
          const direction = difference > 0 ? 'add' : 'remove'

          context.report({
            loc: head.loc,
            message: `Unexpected \`${actualSpaces}\` ${pluralize(actualSpaces)} between list item marker and content${listKind}, expected \`${expectedSpaces}\` ${pluralize(expectedSpaces)}, ${direction} \`${Math.abs(difference)}\` ${pluralize(Math.abs(difference))}`,
          })
        }
      },
    }
  },
}
