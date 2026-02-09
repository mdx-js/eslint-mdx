import path from 'node:path'

import type { Rule } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import {
  DEFAULT_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  getPhysicalFilename,
  performSyncWork,
} from 'eslint-mdx'

import type { RemarkLintMessage } from './types.js'

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
    const filename =
      // eslint-disable-next-line sonarjs/deprecation -- FIXME: ESLint 8.40+ required
      context.filename ?? /* istanbul ignore next */ context.getFilename()
    const extname = path.extname(filename)
    const sourceCode =
      // eslint-disable-next-line sonarjs/deprecation -- FIXME: ESLint 8.40+ required
      context.sourceCode ?? /* istanbul ignore next */ context.getSourceCode()

    /* istanbul ignore next */
    const {
      extensions,
      markdownExtensions,
      ignoreRemarkConfig,
      remarkConfigPath,
    } = {
      // eslint-disable-next-line sonarjs/deprecation -- FIXME: ESLint 8.40+ required
      ...context.parserOptions,
      ...context.languageOptions?.parserOptions,
    } as ParserOptions

    const isMdx = [...DEFAULT_EXTENSIONS, ...(extensions || [])].includes(
      extname,
    )
    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...(markdownExtensions || []),
    ].includes(extname)

    return {
      Program(node) {
        /* istanbul ignore if */
        if (!isMdx && !isMarkdown) {
          return
        }

        const sourceText = sourceCode.getText(node)

        const { messages, content: fixedText } = performSyncWork({
          filePath: getPhysicalFilename(filename),
          code: sourceText,
          // eslint-disable-next-line sonarjs/deprecation -- FIXME: ESLint 8.40+ required
          cwd: context.cwd ?? /* istanbul ignore next */ context.getCwd(),
          isMdx,
          process: true,
          ignoreRemarkConfig,
          remarkConfigPath,
        })

        let fixed = 0

        for (const {
          source,
          reason,
          ruleId,
          fatal,
          line,
          column,
          place,
        } of messages) {
          // https://github.com/remarkjs/remark-lint/issues/65#issuecomment-220800231
          /* istanbul ignore next */
          // eslint-disable-next-line sonarjs/no-nested-conditional
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

          const point = {
            line,
            // ! eslint ast column is 0-indexed, but unified is 1-indexed
            column: column - 1,
          }

          context.report({
            // related to https://github.com/eslint/eslint/issues/14198
            message: JSON.stringify(message),
            loc:
              /* istanbul ignore next */ place && 'start' in place
                ? {
                    ...point,
                    start: { ...place.start, column: place.start.column - 1 },
                    end: { ...place.end, column: place.end.column - 1 },
                  }
                : point,
            node,
            fix:
              fixedText == null || fixedText === sourceText
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
