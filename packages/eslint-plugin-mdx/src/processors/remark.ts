import { Linter } from 'eslint'

import { RemarkLintMessage } from '../rules'

import { markdown } from './markdown'
import { processorOptions } from './options'
import { ESLintProcessor } from './types'

export const remark: ESLintProcessor = {
  supportsAutofix: true,
  preprocess(text, filename) {
    if (!processorOptions.lintCodeBlock) {
      return [text]
    }

    return [...(markdown as ESLintProcessor).preprocess(text, filename), text]
  },
  postprocess(lintMessages, filename) {
    lintMessages = [
      (markdown as ESLintProcessor).postprocess(lintMessages, filename),
    ]

    const messages: Linter.LintMessage[] = []
    for (const lintMessageList of lintMessages) {
      messages.push(
        ...lintMessageList.map(lintMessage => {
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
        }),
      )
    }
    return messages
  },
}
