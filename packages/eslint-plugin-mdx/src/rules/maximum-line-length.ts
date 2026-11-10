/* istanbul ignore file -- POC rule */
import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'maximum-line-length': number | { size?: number | null } | undefined
  }
}

export const maximumLineLength: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce maximum line length' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'maximum-line-length')

    if (!config) {
      return {}
    }

    /* istanbul ignore next -- POC covers numeric options */
    const size =
      typeof config.options === 'object' && config.options !== null
        ? config.options.size
        : config.options
    /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default size */
    const expected = typeof size === 'number' ? size : 80
    const sourceText = context.sourceCode.getText()

    return {
      Program() {
        for (const [index, line] of sourceText.split('\n').entries()) {
          const actual = [...line].length

          if (actual > expected) {
            context.report({
              loc: {
                start: { line: index + 1, column: 0 },
                end: { line: index + 1, column: actual },
              },
              message: `Unexpected \`${actual}\` character line, expected at most \`${expected}\` characters, remove \`${actual - expected}\` characters`,
            })
          }
        }
      },
    }
  },
}
