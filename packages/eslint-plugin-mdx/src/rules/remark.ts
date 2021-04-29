import path from 'path'

import type { Rule } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import { DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS } from 'eslint-mdx'
import { createSyncFn } from 'synckit'
import type { FrozenProcessor } from 'unified'
import vfile from 'vfile'

import { getPhysicalFilename, getRemarkProcessor } from './helpers'
import type { ProcessSync, RemarkLintMessage } from './types'

const processSync = createSyncFn(require.resolve('../worker')) as ProcessSync

const brokenCache = new WeakMap<FrozenProcessor, true>()

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

        const physicalFilename = getPhysicalFilename(filename)

        const sourceText = sourceCode.getText(node)
        const remarkProcessor = getRemarkProcessor(physicalFilename, isMdx)

        const fileOptions = {
          path: filename,
          contents: sourceText,
        }

        const file = vfile(fileOptions)

        let broken = brokenCache.get(remarkProcessor)

        if (broken) {
          const { messages } = processSync(fileOptions, physicalFilename, isMdx)
          file.messages = messages
        } else {
          try {
            remarkProcessor.processSync(file)
          } catch (err) {
            /* istanbul ignore else */
            if (
              (err as Error).message ===
              '`processSync` finished async. Use `process` instead'
            ) {
              brokenCache.set(remarkProcessor, (broken = true))
              const { messages } = processSync(
                fileOptions,
                physicalFilename,
                isMdx,
              )
              file.messages = messages
            } else {
              if (!file.messages.includes(err)) {
                file.message(err).fatal = true
              }
            }
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
              const fixed = broken
                ? processSync(partialText, physicalFilename, isMdx)
                : remarkProcessor.processSync(partialText).toString()
              return fixer.replaceTextRange(
                range,
                partialText.endsWith('\n')
                  ? /* istanbul ignore next */ fixed
                  : fixed.slice(0, -1), // remove redundant new line
              )
            },
          })
        }
      },
    }
  },
}
