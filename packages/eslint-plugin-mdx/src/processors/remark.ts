import type { Linter } from 'eslint'
import { processors } from 'eslint-plugin-markdown'

import type { RemarkLintMessage } from '../rules'

import { getShortLang } from './helpers'
import { processorOptions } from './options'

export const remark: Linter.Processor = {
  supportsAutofix: true,
  preprocess(text, filename) {
    if (!processorOptions.lintCodeBlocks) {
      return [text]
    }

    return [
      text,
      ...processors.markdown
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
      ...processors.markdown.postprocess(markdownMessages, filename),
    ].map(lintMessage => {
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
}
