import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'final-newline': never
  }
}

export const finalNewline: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require a final newline',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'final-newline')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      Program() {
        if (sourceText.length > 0 && !sourceText.endsWith('\n')) {
          context.report({
            loc: {
              start: {
                line: context.sourceCode.getLocFromIndex(sourceText.length)
                  .line,
                column: context.sourceCode.getLocFromIndex(sourceText.length)
                  .column,
              },
              end: {
                line: context.sourceCode.getLocFromIndex(sourceText.length)
                  .line,
                column: context.sourceCode.getLocFromIndex(sourceText.length)
                  .column,
              },
            },
            message:
              'Unexpected missing final newline character, expected line feed (`\\n`) at end of file',
            fix: fixer =>
              fixer.insertTextAfterRange([0, sourceText.length], '\n'),
          })
        }
      },
    }
  },
}
