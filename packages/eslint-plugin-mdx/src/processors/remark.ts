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
  supportsAutofix: true,
}
