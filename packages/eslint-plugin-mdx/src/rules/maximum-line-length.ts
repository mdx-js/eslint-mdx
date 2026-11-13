import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'maximum-line-length': number | { size?: number | null } | undefined
  }
}

interface WalkNode {
  children?: WalkNode[]
  expression?: WalkNode
  loc?: {
    end: { column: number; line: number }
    start: { column: number; line: number }
  }
  type: string
  value?: string | null
}

const IGNORED_TYPES = new Set([
  'MDCode',
  'MDDefinition',
  'MDHeading',
  'MDHtml',
  'MDMath',
  'MDTable',
  'MDToml',
  'MDXFlowExpression',
  'MDXTextExpression',
  'MDYaml',
  'JSXExpressionContainer',
])

const INLINE_TYPES = new Set(['MDImage', 'MDInlineCode', 'MDLink'])

export const maximumLineLength: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce maximum line length' },
    schema: [
      {
        anyOf: [
          { type: 'number' },
          {
            additionalProperties: false,
            properties: { size: { type: ['number', 'null'] } },
            type: 'object',
          },
        ],
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'maximum-line-length')

    if (!config) {
      return {}
    }

    const size =
      typeof config.options === 'object' && config.options !== null
        ? config.options.size
        : config.options
    /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default size */
    const expected = typeof size === 'number' ? size : 80
    const sourceText = context.sourceCode.getText()
    const lines = sourceText.split(/\r?\n/u)

    const blankLines = (node: WalkNode) => {
      /* istanbul ignore if -- AST nodes have locations */
      if (!node.loc) {
        return
      }

      for (
        let line = node.loc.start.line - 1;
        line < node.loc.end.line;
        line++
      ) {
        lines[line] = ''
      }
    }

    const visit = (
      node: WalkNode,
      parent: WalkNode | undefined,
      index: number,
    ) => {
      if (
        node.type === 'ImportDeclaration' ||
        node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportDefaultDeclaration' ||
        node.type === 'ExportNamedDeclaration'
      ) {
        blankLines(node)
        return
      }

      if (IGNORED_TYPES.has(node.type)) {
        blankLines(node)
        return
      }

      if (INLINE_TYPES.has(node.type) && node.loc && parent?.children) {
        const startLine = node.loc.start.line
        const startColumn = node.loc.start.column + 1
        const endColumn = node.loc.end.column + 1
        const next = parent.children[index + 1]
        const nextStart = next?.loc?.start

        if (startColumn <= expected && endColumn >= expected) {
          const hasBreakOpportunity =
            nextStart?.line === startLine &&
            (next.value == null || /^[^\r\n]*[ \t]/u.test(next.value))

          if (!hasBreakOpportunity) {
            blankLines(node)
          }
        }
      }

      if (node.expression) {
        visit(node.expression, node, 0)
      }

      for (const [childIndex, child] of (node.children ?? []).entries()) {
        visit(child, node, childIndex)
      }
    }

    return {
      Program(node) {
        for (const [index, child] of node.body.entries()) {
          visit(child as WalkNode, undefined, index)
        }

        for (const [index, line] of lines.entries()) {
          const actual = [...line].length
          const difference = actual - expected

          if (difference > 0) {
            context.report({
              loc: {
                start: { line: index + 1, column: line.length },
                end: { line: index + 1, column: line.length },
              },
              message: `Unexpected \`${actual}\` character line, expected at most \`${expected}\` characters, remove \`${difference}\` ${difference === 1 ? 'character' : 'characters'}`,
            })
          }
        }
      },
    }
  },
}
