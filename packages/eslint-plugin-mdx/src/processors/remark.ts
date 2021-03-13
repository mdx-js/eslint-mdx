import type { Linter } from 'eslint'

import type { RemarkLintMessage } from '../rules'

import { markdown } from './markdown'
import { processorOptions } from './options'
import type { ESLintProcessor } from './types'

export const remark: ESLintProcessor = {
  supportsAutofix: true,
  preprocess(text, filename) {
    if (!processorOptions.lintCodeBlocks) {
      return [text]
    }

    return [...markdown.preprocess(text, filename), text]
  },
  postprocess(lintMessages, filename) {
    return markdown.postprocess(lintMessages, filename).map(lintMessage => {
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
