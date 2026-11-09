import type { Rule, SourceCode } from 'eslint'
import type { Heading, Root } from 'mdast'
import { visit } from 'unist-util-visit'

interface NativeAst {
  root: Root
  remarkConfig?: {
    rules: Array<{ name: string; options?: unknown }>
  }
}

const getAst = (sourceCode: SourceCode) =>
  sourceCode.ast as unknown as NativeAst

const getRuleOptions = (sourceCode: SourceCode, name: string) => {
  /* istanbul ignore next -- parser attaches config unless it is ignored */
  const rules = getAst(sourceCode).remarkConfig?.rules ?? []
  const rule = rules.find(rule => rule.name === name)

  return rule
    ? { enabled: rule.options !== false, options: rule.options }
    : null
}

const getLoc = (node: { position?: Heading['position'] }) =>
  /* istanbul ignore next -- parser nodes always have positions */
  node.position
    ? {
        start: {
          line: node.position.start.line,
          column: node.position.start.column - 1,
        },
        end: {
          line: node.position.end.line,
          column: node.position.end.column - 1,
        },
      }
    : undefined

export const nativeHeadingIncrement: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn when heading ranks increment by more than one',
    },
    schema: [],
  },
  create(context) {
    const rule = getRuleOptions(context.sourceCode, 'heading-increment')

    if (!rule?.enabled) {
      return {}
    }

    let previous = 0

    return {
      Program() {
        const root = getAst(context.sourceCode).root

        visit(root, 'heading', node => {
          const expected = previous + 1

          if (previous > 0 && node.depth > expected) {
            context.report({
              loc: getLoc(node),
              message: `Unexpected heading rank \`${node.depth}\`, exected rank \`${expected}\``,
            })
          }

          previous = node.depth
        })
      },
    }
  },
}

export const nativeEmphasisMarker: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a consistent emphasis marker',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const rule = getRuleOptions(context.sourceCode, 'emphasis-marker')

    if (!rule?.enabled) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC only covers explicit marker options */
    let expected =
      rule.options === '*' || rule.options === '_' ? rule.options : undefined

    return {
      Program() {
        const root = getAst(context.sourceCode).root

        visit(root, 'emphasis', node => {
          const start = node.position?.start.offset

          /* istanbul ignore if -- parser nodes always have positions */
          if (start == null) {
            return
          }

          const actual = sourceText.charAt(start)

          /* istanbul ignore if -- mdast emphasis starts with a marker */
          if (actual !== '*' && actual !== '_') {
            return
          }

          expected ??= actual

          if (actual === expected) {
            return
          }

          context.report({
            loc: getLoc(node),
            message: `Unexpected emphasis marker \`${actual}\`, expected \`${expected}\``,
            fix: fixer => [
              fixer.replaceTextRange([start, start + 1], expected),
              fixer.replaceTextRange(
                [node.position.end.offset - 1, node.position.end.offset],
                expected,
              ),
            ],
          })
        })
      },
    }
  },
}
