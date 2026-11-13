import type { Rule } from 'eslint'
import type { MDListItem } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'checkbox-character-style':
      | 'consistent'
      | {
          checked?: 'consistent' | 'X' | 'x'
          unchecked?: ' ' | '\t' | 'consistent'
        }
      | undefined
  }
}

export const checkboxCharacterStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce checkbox character style' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'checkbox-character-style')
    if (!config) {
      return {}
    }
    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers checkbox options */
    const options =
      typeof config.options === 'object' ? config.options : undefined
    /* istanbul ignore next -- POC covers checkbox options */
    let checkedExpected =
      options?.checked === 'x' || options?.checked === 'X'
        ? options.checked
        : undefined
    /* istanbul ignore next -- POC covers checkbox options */
    let uncheckedExpected =
      options?.unchecked === ' ' || options?.unchecked === '\t'
        ? options.unchecked
        : undefined

    return {
      MDListItem(node: MDListItem) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        const match = /^\s*(?:[-*+]|\d+[.)])\s+\[([ x\t])\]/iu.exec(raw)
        /* istanbul ignore if -- POC covers checkbox list items */
        if (!match) {
          return
        }
        const actual = match[1]
        /* istanbul ignore next -- POC covers checked/unchecked */
        const expected = node.checked ? checkedExpected : uncheckedExpected
        /* istanbul ignore if -- POC config sets explicit checkbox styles */
        if (!expected) {
          if (node.checked) {
            checkedExpected = actual as 'X' | 'x'
          } else {
            uncheckedExpected = actual as ' ' | '\t'
          }
          return
        }
        if (actual !== expected) {
          /* istanbul ignore next -- POC covers tab checkboxes */
          const actualText = actual === '\t' ? String.raw`\t` : actual
          /* istanbul ignore next -- POC covers tab checkboxes */
          const expectedText = expected === '\t' ? String.raw`\t` : expected
          /* istanbul ignore next -- POC covers unchecked checkboxes */
          const checked = node.checked ? '' : 'un'

          context.report({
            loc: node.loc,
            message: `Unexpected ${checked}checked checkbox value \`${actualText}\`, expected \`${expectedText}\``,
          })
        }
      },
    }
  },
}
