/// <reference path="../../typings.d.ts" />

import { Rule } from 'eslint'
import { isJsxNode, openTag } from 'eslint-mdx'
import reactNoUnescapedEntities from 'eslint-plugin-react/lib/rules/no-unescaped-entities'

import { NodeWithParent } from './types'

export type EscapeEntity =
  | string
  | {
      char: string
      alternatives: string[]
    }

// copied from `eslint-plugin-react`
const DEFAULTS: EscapeEntity[] = [
  {
    char: '>',
    alternatives: ['&gt;'],
  },
  {
    char: '"',
    alternatives: ['&quot;', '&ldquo;', '&#34;', '&rdquo;'],
  },
  {
    char: "'",
    alternatives: ['&apos;', '&lsquo;', '&#39;', '&rsquo;'],
  },
  {
    char: '}',
    alternatives: ['&#125;'],
  },
]

const EXPRESSION = 'Literal, JSXText'

export const noUnescapedEntities: Rule.RuleModule = {
  ...reactNoUnescapedEntities,
  create(context) {
    const configuration = context.options[0] || {}
    const entities: EscapeEntity[] = configuration.forbid || DEFAULTS
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      [EXPRESSION](node: NodeWithParent) {
        let { parent } = node

        if (!isJsxNode(parent)) {
          return
        }

        while (parent) {
          if (parent.parent.type === 'Program') {
            break
          } else {
            parent = parent.parent
          }
        }

        const {
          start: { line: startLine, column: startColumn },
          end: { line: endLine, column: endColumn },
        } = node.loc

        const { lines } = context.getSourceCode()

        let firstLineOffset =
          parent.loc.start.line < startLine
            ? 0
            : lines
                .slice(startLine - 1, endLine)
                .join('\n')
                .search(openTag)

        /* istanbul ignore if */
        if (firstLineOffset < 0) {
          // should never happen, just for robustness
          firstLineOffset = 0
        }

        for (let i = startLine; i <= endLine; i++) {
          let rawLine = lines[i - 1]
          let start = 0
          let end = rawLine.length
          if (i === startLine) {
            start = startColumn + firstLineOffset
          }
          if (i === endLine) {
            end = endColumn
            if (i === startLine) {
              end += firstLineOffset
            }
          }
          rawLine = rawLine.substring(start, end)
          entities.forEach(entity => {
            for (let index = 0; index < rawLine.length; index++) {
              const char = rawLine[index]
              if (typeof entity === 'string') {
                if (char === entity) {
                  context.report({
                    loc: { line: i, column: start + index },
                    message: `HTML entity, \`${entity}\` , must be escaped.`,
                    node,
                  })
                }
              } else if (char === entity.char) {
                context.report({
                  loc: { line: i, column: start + index },
                  message: `\`${
                    entity.char
                  }\` can be escaped with ${entity.alternatives
                    .map(alt => '``'.split('').join(alt))
                    .join(', ')}.`,
                  node,
                })
              }
            }
          })
        }
      },
    }
  },
}
