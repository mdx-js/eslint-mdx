import path from 'path'

import type { Rule } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import { DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS } from 'eslint-mdx'
import { createSyncFn } from 'synckit'
import type { FrozenProcessor } from 'unified'
import type { VFile, VFileOptions } from 'vfile'
import vfile from 'vfile'

import { getPhysicalFilename, getRemarkProcessor } from './helpers'
import type { RemarkLintMessage } from './types'

const workerPath = require.resolve('../worker')

// call `creatSyncFn` lazily for performance, it is already cached inside, related #323
const lazyRemark = {
  get processSync() {
    return createSyncFn(workerPath) as (
      fileOptions: VFileOptions,
      physicalFilename: string,
      isMdx: boolean,
    ) => {
      messages: VFile['messages']
      content: string
    }
  },
}

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
          path: physicalFilename,
          contents: sourceText,
        }

        const file = vfile(fileOptions)
        let fixedText: string

        let broken = brokenCache.get(remarkProcessor)

        if (broken) {
          const { messages, content } = lazyRemark.processSync(
            fileOptions,
            physicalFilename,
            isMdx,
          )
          file.messages = messages
          fixedText = content
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
              const { messages, content } = lazyRemark.processSync(
                fileOptions,
                physicalFilename,
                isMdx,
              )
              file.messages = messages
              fixedText = content
            } else if (!file.messages.includes(err)) {
              file.message(err).fatal = true
            }
          }
        }

        if (!broken) {
          fixedText = file.toString()
        }

        let fixed = 0

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
