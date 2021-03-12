import path from 'path'

import { AST, CLIEngine, Linter, Rule } from 'eslint'
import { ParserServices, getShortLanguage } from 'eslint-mdx'

import { getRangeByLoc, parseContext } from './helper'

export const codeBlock: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Lint code blocks',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
  },
  create(context) {
    const { isMdx, isMarkdown, filename, sourceCode } = parseContext(context)
    // eslint-disable-next-line sonar/deprecation -- w
    const cli = new CLIEngine({
      ignore: false,
    })
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      Program() {
        if (!isMdx && !isMarkdown) {
          return
        }

        const { codeBlocks } = context.parserServices as ParserServices

        // eslint-disable-next-line unicorn/no-array-for-each
        codeBlocks.forEach(({ lang, value, position: { start } }, index) => {
          const language = getShortLanguage(lang)
          const { results } = cli.executeOnText(
            value,
            path.resolve(filename, `${index}.${language}`),
          )
          for (const { messages } of results) {
            for (const message of messages) {
              let {
                line = 1,
                column = 1,
                endLine,
                endColumn,
                fix,
                suggestions,
              } = message
              const hasEnd = endLine != null && endColumn != null

              line += start.line
              column += start.column - 1

              let range: [number, number]

              const startPosition = {
                line,
                column,
              }

              let loc:
                | AST.SourceLocation
                | { line: number; column: number } = startPosition

              let offset: number

              if (hasEnd) {
                endLine += start.line
                endColumn += start.column - 1

                loc = {
                  start: loc,
                  end: { line: endLine, column: endColumn },
                }

                range = getRangeByLoc(sourceCode.text, loc)

                if (fix) {
                  const offsetStart = range[0] - fix.range[0]
                  const offsetEnd = range[1] - fix.range[1]
                  // should always be true, just for robustness
                  /* istanbul ignore else */
                  if (offsetStart === offsetEnd) {
                    offset = offsetStart
                  }
                }
              }

              const lintMessage: Linter.LintMessage = {
                ...message,
                ...startPosition,
                endLine: hasEnd ? endLine : null,
                endColumn: hasEnd ? endColumn : null,
                fix: range &&
                  fix && {
                    range,
                    text: fix.text,
                  },
                suggestions:
                  // FIXME: find a better way to support suggestions with correct range
                  /* istanbul ignore next */
                  !suggestions || offset == null
                    ? null
                    : suggestions.map(({ fix: { range, text }, ...rest }) => ({
                        fix: {
                          range: [range[0] + offset, range[1] + offset],
                          text,
                        },
                        ...rest,
                      })),
              }

              context.report({
                message: JSON.stringify(lintMessage),
                loc,
              })
            }
          }
        })
      },
    }
  },
}
