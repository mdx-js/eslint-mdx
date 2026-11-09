import type { SourceCode } from 'eslint'
import type { RemarkRuleOptions, ResolvedRemarkConfig } from 'eslint-mdx'

export const getRuleConfig = <RuleName extends keyof RemarkRuleOptions>(
  sourceCode: SourceCode,
  name: RuleName,
) => {
  const services = (
    sourceCode as unknown as {
      parserServices: {
        remarkConfig: ResolvedRemarkConfig
      }
    }
  ).parserServices
  const { ruleOptions, settings } = services.remarkConfig
  const options = name in ruleOptions ? ruleOptions[name] : false

  return options === false ? null : { options, settings }
}
