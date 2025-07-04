import type { Linter } from 'eslint'

import { meta } from '../meta.js'
import type { RemarkLintMessage } from '../rules/index.js'

import { getShortLang } from './helpers.js'
import { markdownProcessor } from './markdown.js'
import { processorOptions as defaultProcessorOptions } from './options.js'

export const createRemarkProcessor = ({
  languageMapper,
  lintCodeBlocks,
  ...syncOptions
} = defaultProcessorOptions): Linter.Processor => ({
  meta: {
    name: 'mdx/remark',
    version: meta.version,
  },
  supportsAutofix: true,
  preprocess(text, filename) {
    if (!lintCodeBlocks) {
      return [text]
    }

    return [
      text,
      ...markdownProcessor
        .preprocess(text, filename, syncOptions)
        .map(({ text, filename }) => ({
          text,
          filename:
            filename.slice(0, filename.lastIndexOf('.')) +
            '.' +
            getShortLang(filename, languageMapper),
        })),
    ]
  },
  postprocess([mdxMessages, ...markdownMessages], filename) {
    return [
      ...mdxMessages,
      ...markdownProcessor.postprocess(markdownMessages, filename),
    ]
      .sort((a, b) => a.line - b.line || a.column - b.column)
      .map(lintMessage => {
        const {
          message,
          ruleId: eslintRuleId,
          severity: eslintSeverity,
        } = lintMessage

        if (eslintRuleId !== 'mdx/remark') {
          return lintMessage
        }

        const { source, ruleId, reason, severity } = JSON.parse(
          message,
        ) as RemarkLintMessage

        return {
          ...lintMessage,
          ruleId: `${source}-${ruleId}`,
          message: reason,
          severity: Math.max(
            eslintSeverity,
            severity,
          ) as Linter.LintMessage['severity'],
        }
      })
  },
})

export const remark: Linter.Processor = createRemarkProcessor()
