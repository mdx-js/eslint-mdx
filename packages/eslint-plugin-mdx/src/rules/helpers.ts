import type { SourceCode } from 'eslint'
import type { RemarkRuleOptions, RemarkConfig } from 'eslint-mdx'

export const NATIVE_REMARK_RULES = new Set([
  'emphasis-marker',
  'heading-increment',
  'no-duplicate-headings',
  'no-file-name-articles',
  'no-file-name-consecutive-dashes',
  'no-file-name-irregular-characters',
  'no-file-name-mixed-case',
  'no-file-name-outer-dashes',
  'no-heading-punctuation',
  'no-unused-definitions',
  'no-shortcut-reference-image',
  'no-shortcut-reference-link',
  'strong-marker',
  'unordered-list-marker-style',
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
