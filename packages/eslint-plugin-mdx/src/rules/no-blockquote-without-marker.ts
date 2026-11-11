import type { Rule } from 'eslint'
import type { MDParagraph } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-blockquote-without-marker': never
  }
}

const plural = (count: number) => (count === 1 ? 'marker' : 'markers')

const countMarkers = (line: string) => {
  let count = 0

  for (const char of line) {
    if (char === '>') {
      count++
    } else if (char !== ' ' && char !== '\t') {
      break
    }
  }

  return count
}

export const noBlockquoteWithoutMarker: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow blockquotes without markers' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-blockquote-without-marker',
    )

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    let depth = 0

    return {
      MDBlockquote() {
        depth++
      },
      'MDBlockquote:exit'() {
        depth--
      },
      MDParagraph(node: MDParagraph) {
        if (depth === 0) {
          return
        }

        const lines = sourceText.slice(node.range[0], node.range[1]).split('\n')

        for (const [index, line] of lines.entries()) {
          /* istanbul ignore if -- POC covers marker lines */
          if (index === 0 || !line.trim()) {
            continue
          }

          const actual = countMarkers(line)
          const expected = depth

          if (actual !== expected) {
            const difference = expected - actual

            context.report({
              loc: {
                start: {
                  line: node.loc.start.line + index,
                  column: 0,
                },
                end: {
                  line: node.loc.start.line + index,
                  column: line.length,
                },
              },
              message: `Unexpected \`${actual}\` block quote ${plural(actual)} before paragraph line, expected \`${expected}\` ${plural(expected)}, ${['remove', 'remove', 'add'][Math.sign(difference) + 1]} \`${Math.abs(difference)}\` ${plural(Math.abs(difference))}`,
            })
          }
        }
      },
    }
  },
}
