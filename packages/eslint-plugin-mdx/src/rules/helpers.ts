import type { SourceCode } from 'eslint'
import type { RemarkRuleOptions, RemarkConfig } from 'eslint-mdx'

export const NATIVE_REMARK_RULES = new Set([
  'emphasis-marker',
  'heading-increment',
])

export const getRuleConfig = <RuleName extends keyof RemarkRuleOptions>(
  sourceCode: SourceCode,
  name: RuleName,
) => {
  const {
    remarkConfig: { ruleOptions, settings },
    // type-coverage:ignore-next-line -- bad typings
  } = sourceCode.parserServices as { remarkConfig: RemarkConfig }
  return name in ruleOptions ? { options: ruleOptions[name], settings } : null
}
