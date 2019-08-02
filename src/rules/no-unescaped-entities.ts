// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../../types.d.ts" />

import reactNoUnEscapedEntities from 'eslint-plugin-react/lib/rules/no-unescaped-entities'

import { openTag } from '../regexp'

import { isJsxNode } from './helper'
import { NodeWithParent } from './types'

import { Rule } from 'eslint'

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

export const noUnEscapedEntities: Rule.RuleModule = {
  ...reactNoUnEscapedEntities,
  create(context) {
    const configuration = context.options[0] || {}
    const entities: EscapeEntity[] = configuration.forbid || DEFAULTS
    return {
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

        if (firstLineOffset < 0) {
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
                    .map(alt => `\`${alt}\``)
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
