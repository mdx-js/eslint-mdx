import type { Rule } from 'eslint'
import type { MDList, MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'list-item-indent': 'mixed' | 'one' | 'tab' | undefined
  }
}

type Style = 'mixed' | 'one' | 'tab'

const CHARS_PER_TAB = 4

const pluralize = (count: number) => (count === 1 ? 'space' : 'spaces')

const getListKind = (style: Style, loose: boolean) => {
  if (style !== 'mixed') {
    return ''
  }

  return loose ? ' in loose list' : ' in tight list'
}

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

    const style: Style = configured ?? 'one'

    const checkItem = (item: MDListItem, loose: boolean) => {
      const head = item.children[0]

      /* istanbul ignore if -- list items have children */
      if (!head) {
        return
      }

      let slice = sourceText.slice(item.range[0], head.range[0])
      const checkbox = slice.indexOf('[')

      /* istanbul ignore if -- POC covers checkbox items */
      if (checkbox !== -1) {
        slice = slice.slice(0, checkbox)
      }

      let end = slice.length

      while (end > 0 && (slice[end - 1] === ' ' || slice[end - 1] === '\t')) {
        end--
      }

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
        const listKind = getListKind(style, loose)
        const direction = difference > 0 ? 'add' : 'remove'

        context.report({
          loc: head.loc,
          message: `Unexpected \`${actualSpaces}\` ${pluralize(actualSpaces)} between list item marker and content${listKind}, expected \`${expectedSpaces}\` ${pluralize(expectedSpaces)}, ${direction} \`${Math.abs(difference)}\` ${pluralize(Math.abs(difference))}`,
        })
      }
    }

    return {
      MDList(list: MDList) {
        const loose =
          list.spread ||
          list.children.some(item => 'spread' in item && item.spread)

        for (const item of list.children) {
          checkItem(item, loose)
        }
      },
    }
  },
}
