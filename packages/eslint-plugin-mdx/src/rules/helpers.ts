import type { SourceCode } from 'eslint'
import type { RemarkRuleOptions, RemarkConfig } from 'eslint-mdx'

export const NATIVE_REMARK_RULES = new Set([
  'emphasis-marker',
  'final-newline',
  'fenced-code-marker',
  'heading-increment',
  'heading-style',
  'definition-case',
  'definition-spacing',
  'no-consecutive-blank-lines',
  'no-duplicate-definitions',
  'no-duplicate-headings',
  'no-duplicate-headings-in-section',
  'no-file-name-articles',
  'no-file-name-consecutive-dashes',
  'no-file-name-irregular-characters',
  'no-file-name-mixed-case',
  'no-file-name-outer-dashes',
  'no-emphasis-as-heading',
  'maximum-heading-length',
  'no-heading-content-indent',
  'link-title-style',
  'no-heading-punctuation',
  'ordered-list-marker-style',
  'no-literal-urls',
  'no-multiple-toplevel-headings',
  'no-unused-definitions',
  'rule-style',
  'no-shell-dollars',
  'no-table-indentation',
  'no-shortcut-reference-image',
  'no-shortcut-reference-link',
  'strong-marker',
  'unordered-list-marker-style',
  'blockquote-indentation',
  'checkbox-character-style',
  'code-block-style',
  'fenced-code-flag',
  'file-extension',
  'final-definition',
  'hard-break-spaces',
  'list-item-bullet-indent',
  'list-item-content-indent',
  'list-item-indent',
  'list-item-spacing',
  'maximum-line-length',
  'no-blockquote-without-marker',
  'no-undefined-references',
  'ordered-list-marker-value',
  'table-cell-padding',
  'table-pipe-alignment',
  'table-pipes',
])

export const getRuleConfig = <RuleName extends keyof RemarkRuleOptions>(
  sourceCode: SourceCode,
  name: RuleName,
) => {
  const {
    remarkConfig: { ruleOptions },
    // type-coverage:ignore-next-line -- bad typings
  } = sourceCode.parserServices as { remarkConfig: RemarkConfig }
  return name in ruleOptions ? { options: ruleOptions[name] } : null
}
