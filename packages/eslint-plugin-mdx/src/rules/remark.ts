import path from 'path'

import type { Rule } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import { DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS } from 'eslint-mdx'
import vfile from 'vfile'

import { getRemarkProcessor } from './helpers'
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
    const filename = context.getFilename()
    const extname = path.extname(filename)
    const sourceCode = context.getSourceCode()
    const options = context.parserOptions as ParserOptions
    const isMdx = DEFAULT_EXTENSIONS.concat(options.extensions || []).includes(
      extname,
    )
    const isMarkdown = MARKDOWN_EXTENSIONS.concat(
      options.markdownExtensions || [],
    ).includes(extname)
    return {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      Program(node) {
        /* istanbul ignore if */
        if (!isMdx && !isMarkdown) {
          return
        }
        const sourceText = sourceCode.getText(node)
        const remarkProcessor = getRemarkProcessor(filename, isMdx)
        const file = vfile({
          path: filename,
          contents: sourceText,
        })

        try {
          remarkProcessor.processSync(file)
        } catch (err) {
          /* istanbul ignore next */
          if (!file.messages.includes(err)) {
            file.message(err).fatal = true
          }
        }

        for (const {
          source,
          reason,
          ruleId,
          fatal,
          location: { start, end },
        } of file.messages) {
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
              // ! eslint ast column is 0-indexed, but unified is 1-indexed
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
            fix(fixer) {
              /* istanbul ignore if */
              if (start.offset == null) {
                return null
              }
              const range: [number, number] = [
                start.offset,
                /* istanbul ignore next */
                end.offset == null ? start.offset + 1 : end.offset,
              ]
              const partialText = sourceText.slice(...range)
              const fixed = remarkProcessor.processSync(partialText).toString()
              return fixer.replaceTextRange(
                range,
                /* istanbul ignore next */
                partialText.endsWith('\n') ? fixed : fixed.slice(0, -1), // remove redundant new line
              )
            },
          })
        }
      },
    }
  },
}
