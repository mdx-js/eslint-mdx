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
    /* istanbul ignore next -- POC covers numeric options */
    /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- default size */
    const expected = typeof size === 'number' ? size : 80
    const sourceText = context.sourceCode.getText()
    const ignoredLines = new Set<number>()
    const unwrappable = new Set<string>()

    const ignore = (node: {
      loc?: { end: { line: number }; start: { line: number } }
    }) => {
      /* istanbul ignore if -- AST nodes have locations */
      if (!node.loc) {
        return
      }

      for (let line = node.loc.start.line; line <= node.loc.end.line; line++) {
        ignoredLines.add(line)
      }
    }

    const track = (node: {
      loc?: {
        end: { column: number; line: number }
        start: { column: number; line: number }
      }
    }) => {
      /* istanbul ignore next -- POC covers single-line spans */
      if (node.loc && node.loc.start.line === node.loc.end.line) {
        for (
          let column = node.loc.start.column;
          column < node.loc.end.column;
          column++
        ) {
          unwrappable.add(`${node.loc.start.line}:${column}`)
        }
      }
    }

    return {
      MDCode: ignore,
      MDImage: track,
      MDInlineCode: track,
      MDLink: track,
      MDDefinition: ignore,
      MDFootnoteDefinition: ignore,
      MDHeading: ignore,
      MDTable: ignore,
      'Program:exit'() {
        for (const [index, line] of sourceText.split('\n').entries()) {
          const lineNumber = index + 1
          const actual = [...line].length

          if (ignoredLines.has(lineNumber)) {
            continue
          }

          if (unwrappable.has(`${lineNumber}:${expected}`)) {
            continue
          }

          if (actual > expected) {
            context.report({
              loc: {
                start: { line: lineNumber, column: 0 },
                end: { line: lineNumber, column: actual },
              },
              message: `Unexpected \`${actual}\` character line, expected at most \`${expected}\` characters, remove \`${actual - expected}\` characters`,
            })
          }
        }
      },
    }
  },
}
