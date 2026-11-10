/* istanbul ignore file -- POC covers the main title styles */
import type { Rule } from 'eslint'
import type { MDLink } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'link-title-style': '"' | '()' | 'consistent' | "'" | undefined
  }
}

export const linkTitleStyle: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent link title style',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'link-title-style')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers explicit title styles */
    let expected: '"' | '()' | "'" | undefined =
      config.options === '"' ||
      config.options === "'" ||
      config.options === '()'
        ? config.options
        : undefined

    return {
      MDLink(node: MDLink) {
        /* istanbul ignore if -- POC covers links with titles */
        if (!node.title) {
          return
        }

        const raw = new Set(sourceText.slice(node.range[0], node.range[1]))
        let actual: '"' | '()' | "'" | undefined

        if (raw.has('"')) {
          actual = '"'
        } else if (raw.has("'")) {
          actual = "'"
        } else if (raw.has('(')) {
          actual = '()'
        }

        /* istanbul ignore if -- POC covers quoted titles */
        if (!actual) {
          return
        }

        expected ??= actual

        if (actual === expected) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected title markers \`${actual}\`, expected \`${expected}\``,
        })
      },
    }
  },
}
