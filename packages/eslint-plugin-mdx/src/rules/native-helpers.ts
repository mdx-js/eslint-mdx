import type { SourceCode } from 'eslint'

export interface MarkdownNode {
  type: string
  loc: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  range: [number, number]
  depth?: number
}

export const getRuleOptions = (sourceCode: SourceCode, name: string) => {
  const rules = (
    sourceCode.ast as unknown as {
      remarkConfig: {
        rules: Array<{ name: string; options?: unknown }>
      }
    }
  ).remarkConfig.rules
  const rule = rules.find(rule => rule.name === name)

  return rule
    ? { enabled: rule.options !== false, options: rule.options }
    : null
}
