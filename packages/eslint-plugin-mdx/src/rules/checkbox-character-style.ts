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
    schema: [
      {
        anyOf: [
          { enum: ['consistent'], type: 'string' },
          {
            additionalProperties: false,
            properties: {
              checked: { enum: ['consistent', 'X', 'x'], type: 'string' },
              unchecked: { enum: [' ', '\t', 'consistent'], type: 'string' },
            },
            type: 'object',
          },
        ],
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'checkbox-character-style')
    if (!config) {
      return {}
    }
    const options =
      typeof config.options === 'object' ? config.options : undefined
    let checkedExpected =
      options?.checked === 'x' || options?.checked === 'X'
        ? options.checked
        : undefined
    let uncheckedExpected =
      options?.unchecked === ' ' || options?.unchecked === '\t'
        ? options.unchecked
        : undefined

    return {
      MDListItem(node: MDListItem) {
        if (typeof node.checked !== 'boolean') {
          return
        }

        const match = /^\s*(?:[-*+]|\d+[.)])\s+\[([ x\t])\]/iu.exec(node.raw)
        const actual = match[1]
        const expected = node.checked ? checkedExpected : uncheckedExpected
        if (!expected) {
          if (node.checked) {
            checkedExpected = actual as 'X' | 'x'
          } else {
            uncheckedExpected = actual as ' ' | '\t'
          }
          return
        }
        if (actual !== expected) {
          const actualText = actual === '\t' ? String.raw`\t` : actual
          const expectedText = expected === '\t' ? String.raw`\t` : expected
          const checked = node.checked ? '' : 'un'

          const checkboxLoc = context.sourceCode.getLocFromIndex(
            node.range[0] + match[0].length - 1,
          )

          context.report({
            loc: {
              start: checkboxLoc,
              end: { ...checkboxLoc, column: checkboxLoc.column + 1 },
            },
            message: `Unexpected ${checked}checked checkbox value \`${actualText}\`, expected \`${expectedText}\``,
          })
        }
      },
    }
  },
}
