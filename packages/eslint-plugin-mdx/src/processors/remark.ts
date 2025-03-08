import type { Linter } from 'eslint'

import { meta } from '../meta'
import type { RemarkLintMessage } from '../rules'

import { getShortLang } from './helpers'
import { markdownProcessor } from './markdown'
import { processorOptions as defaultProcessorOptions } from './options'

export const createRemarkProcessor = (
  processorOptions = defaultProcessorOptions,
): Linter.Processor => ({
  meta: {
    name: 'mdx/remark',
    version: meta.version,
  },
  supportsAutofix: true,
  preprocess(text, filename) {
    if (!processorOptions.lintCodeBlocks) {
      return [text]
    }

    return [
      text,
      ...markdownProcessor
        .preprocess(text, filename)
        .map(({ text, filename }) => ({
          text,
          filename:
            filename.slice(0, filename.lastIndexOf('.')) +
            '.' +
            getShortLang(filename, processorOptions.languageMapper),
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
          severity: Math.max(eslintSeverity, severity) as Linter.Severity,
        }
      })
  },
})

export const remark: Linter.Processor = createRemarkProcessor()
