// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../../types.d.ts" />

import reactNoUnEscapedEntities from 'eslint-plugin-react/lib/rules/no-unescaped-entities'

import { first } from '../helper'

import { NodeWithParent } from './types'

import { Rule, SourceCode } from 'eslint'

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
    const esLintRuleListener = reactNoUnEscapedEntities.create(context)
    const configuration = context.options[0] || {}
    const entities: EscapeEntity[] = configuration.forbid || DEFAULTS
    return {
      [EXPRESSION](node: NodeWithParent) {
        let { parent } = node
        while (parent) {
          if (parent.parent.type === 'Program') {
            break
          } else {
            parent = parent.parent
          }
        }
        if (parent.type === 'ExpressionStatement') {
          const sourceCode = context.getSourceCode()
          const firstLine = sourceCode.getLines()[parent.loc.start.line - 1]
          const jsxFirstLine = first(
            SourceCode.splitLines(sourceCode.getText(parent)),
          )
          const firstLineOffset = firstLine.length - jsxFirstLine.length
          const nodeText = sourceCode.getText(node)
          const line = 1
          const column = 1
          console.log(nodeText)
          entities.forEach(entity => {
            let index: number
            if (typeof entity === 'string') {
              if ((index = nodeText.indexOf(entity)) !== -1) {
                context.report({
                  loc: { line, column },
                  message: `HTML entity, \`${entity}\` , must be escaped.`,
                  node,
                })
              }
            } else if ((index = nodeText.indexOf(entity.char)) !== -1) {
              context.report({
                loc: { line, column },
                message: `\`${
                  entity.char
                }\` can be escaped with ${entity.alternatives
                  .map(alt => `\`${alt}\``)
                  .join(', ')}.`,
                node,
              })
            }
          })
          // inline html comments should not be escaped
          if (firstLineOffset && firstLine.endsWith(jsxFirstLine)) {
            return
          }
        }
        // @ts-ignore
        esLintRuleListener[EXPRESSION](node)
      },
    }
  },
}
