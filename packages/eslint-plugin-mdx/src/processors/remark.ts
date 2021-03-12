import { Linter } from 'eslint'

import { RemarkLintMessage } from '../rules'

export const remark = {
  postprocess(lintMessages: Linter.LintMessage[][]): Linter.LintMessage[] {
    const messages: Linter.LintMessage[] = []
    for (const lintMessageList of lintMessages) {
      messages.push(
        ...lintMessageList.map(lintMessage => {
          const {
            message,
            ruleId: eslintRuleId,
            severity: eslintSeverity,
          } = lintMessage

          switch (eslintRuleId) {
            case 'mdx/remark': {
              const { source, ruleId, reason, severity } = JSON.parse(
                message,
              ) as RemarkLintMessage

              return {
                ...lintMessage,
                ruleId: `${source}-${ruleId}`,
                message: reason,
                severity: Math.max(eslintSeverity, severity) as Linter.Severity,
              }
            }
            case 'mdx/code-block': {
              const originalLintMessage = JSON.parse(
                message,
              ) as Linter.LintMessage
              return {
                ...originalLintMessage,
                severity: Math.min(
                  eslintSeverity,
                  originalLintMessage.severity,
                ) as Linter.Severity,
              }
            }
            default: {
              return lintMessage
            }
          }
        }),
      )
    }
    return messages
  },
  supportsAutofix: true,
}
