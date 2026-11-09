import type { SourceCode } from 'eslint'

export const getRuleOptions = (sourceCode: SourceCode, name: string) => {
  const services = (
    sourceCode as unknown as {
      parserServices: {
        remarkConfig: {
          rules: Array<{ name: string; options?: unknown }>
        }
      }
    }
  ).parserServices
  const rules = services.remarkConfig.rules
  const rule = rules.find(rule => rule.name === name)

  return rule
    ? { enabled: rule.options !== false, options: rule.options }
    : null
}
