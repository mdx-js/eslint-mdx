import path from 'node:path'

import type { Rule } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import {
  DEFAULT_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  getPhysicalFilename,
  performSyncWork,
} from 'eslint-mdx'

import type { RemarkLintMessage } from './types'

export const remark: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Linter integration with remark plugins',
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
  },
  create(context) {
    // eslint-disable-next-line sonar/deprecation -- FIXME: ESLint 8.40+ required
    const filename = context.getFilename()
    const extname = path.extname(filename)
    // eslint-disable-next-line sonar/deprecation -- FIXME: ESLint 8.40+ required
    const sourceCode = context.getSourceCode()
    const options = context.parserOptions as ParserOptions
    const isMdx = [
      ...DEFAULT_EXTENSIONS,
      ...(options.extensions || []),
    ].includes(extname)
    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...(options.markdownExtensions || []),
    ].includes(extname)
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      Program(node) {
        /* istanbul ignore if */
        if (!isMdx && !isMarkdown) {
          return
        }

        const ignoreRemarkConfig = Boolean(options.ignoreRemarkConfig)

        const physicalFilename = getPhysicalFilename(filename)

        const sourceText = sourceCode.getText(node)

        const { messages, content: fixedText } = performSyncWork({
          fileOptions: {
            path: physicalFilename,
            value: sourceText,
            // eslint-disable-next-line sonar/deprecation -- FIXME: ESLint 8.40+ required
            cwd: context.getCwd(),
          },
          physicalFilename,
          isMdx,
          process: true,
          ignoreRemarkConfig,
        })

        let fixed = 0

        for (const {
          source,
          reason,
          ruleId,
          fatal,
          line,
          column,
          position: { start, end },
        } of messages) {
          // https://github.com/remarkjs/remark-lint/issues/65#issuecomment-220800231
          /* istanbul ignore next */
          const severity = fatal ? 2 : fatal == null ? 0 : 1
          /* istanbul ignore if */
          if (!severity) {
            // should never happen, just for robustness
            continue
          }

          const message: RemarkLintMessage = {
            reason,
            source,
            ruleId,
            severity,
          }
          context.report({
            // related to https://github.com/eslint/eslint/issues/14198
            message: JSON.stringify(message),
            loc: {
              line,
              // ! eslint ast column is 0-indexed, but unified is 1-indexed
              column: column - 1,
              start: {
                ...start,
                column: start.column - 1,
              },
              end: {
                ...end,
                column: end.column - 1,
              },
            },
            node,
            fix:
              fixedText === sourceText
                ? null
                : () =>
                    fixed++
                      ? null
                      : {
                          range: [0, sourceText.length],
                          text: fixedText,
                        },
          })
        }
      },
    }
  },
}
