import path from 'node:path'

import type { Rule } from 'eslint'
import type { ParserOptions, RemarkRuleOptions, RemarkConfig } from 'eslint-mdx'
import { DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS, arrayify } from 'eslint-mdx'

/** JSON Schema for option values that cannot be expressed, such as functions and RegExp. */
export const ANY_OPTION_SCHEMA = {}

export const getParserOptions = (context: Rule.RuleContext): ParserOptions => {
  const options = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore -- ESLint v10 removed
    ...context.parserOptions,
    ...context.languageOptions?.parserOptions,
  } as ParserOptions

  return options
}

export const isMdxFile = (
  filename: string,
  extensions: ParserOptions['extensions'],
) =>
  [...DEFAULT_EXTENSIONS, ...arrayify(extensions)].includes(
    path.extname(filename),
  )

export const isMarkdownFile = (
  filename: string,
  markdownExtensions: ParserOptions['markdownExtensions'],
) =>
  [...MARKDOWN_EXTENSIONS, ...arrayify(markdownExtensions)].includes(
    path.extname(filename),
  )

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
  context: Rule.RuleContext,
  name: RuleName,
) => {
  const {
    remarkConfig,
    // type-coverage:ignore-next-line -- bad typings
  } = context.sourceCode.parserServices as {
    remarkConfig?: RemarkConfig
  }

  if (!remarkConfig) {
    return null
  }

  const { ruleOptions } = remarkConfig
  // type-coverage:ignore-next-line -- ESLint types RuleContext.options as any[]
  const eslintOptions = context.options as readonly unknown[]
  const hasEslintOption = eslintOptions.length > 0
  const hasRemarkOption = name in ruleOptions

  if (!hasEslintOption && !hasRemarkOption) {
    return null
  }

  return {
    options: (hasEslintOption
      ? eslintOptions[0]
      : ruleOptions[name]) as RemarkRuleOptions[RuleName],
  }
}

export interface TextNode {
  alt?: string | null
  children?: TextNode[]
  type: string
  value?: string | null
}

/**
 * Native AST adaptation of `mdast-util-to-string` for MD and JSX nodes.
 */
export const getNodeText = (node: TextNode): string => {
  if (node.type === 'MDHtml') {
    return ''
  }

  if (node.value != null) {
    return node.value
  }

  if (node.alt) {
    return node.alt
  }

  return (node.children ?? []).map(child => getNodeText(child)).join('')
}
