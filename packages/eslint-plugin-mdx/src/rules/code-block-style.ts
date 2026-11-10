/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'
import type { MDCode } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'code-block-style': 'consistent' | 'fenced' | 'indented' | undefined
  }
}

export const codeBlockStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce code block style' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'code-block-style')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let expected =
      config.options === 'fenced' || config.options === 'indented'
        ? config.options
        : undefined

    return {
      MDCode(node: MDCode) {
        const raw = sourceText.slice(node.range[0], node.range[1])
        const actual = /^\s*(?:`{3,}|~{3,})/u.test(raw) ? 'fenced' : 'indented'
        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected ${actual} code block, expected ${expected} code blocks`,
        })
      },
    }
  },
}
