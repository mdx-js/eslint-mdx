import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-undefined-references': never
  }
}

export const noUndefinedReferences: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow undefined references' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-undefined-references')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    return {
      Program() {
        const definitions = new Set<string>()
        const lines = sourceText.split('\n')

        for (const line of lines) {
          if (line.startsWith('[')) {
            const close = line.indexOf(']:')

            if (close > 1) {
              definitions.add(line.slice(1, close))
            }
          }
        }

        for (const [lineIndex, line] of lines.entries()) {
          // eslint-disable-next-line sonarjs/super-linear-regex -- short inline references
          for (const match of line.matchAll(/\[[^\]]*\]\[([^\]]+)\]/gu)) {
            const identifier = match[1]

            if (!definitions.has(identifier)) {
              context.report({
                loc: {
                  start: { line: lineIndex + 1, column: match.index },
                  end: {
                    line: lineIndex + 1,
                    column: match.index + match[0].length,
                  },
                },
                message: `Unexpected reference to undefined definition \`${identifier}\``,
              })
            }
          }
        }
      },
    }
  },
}
