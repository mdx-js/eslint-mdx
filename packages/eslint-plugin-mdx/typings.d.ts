declare module 'eslint/lib/rules/no-unused-expressions' {
  import { Rule } from 'eslint'
  const esLintNoUnusedExpressions: Rule.RuleModule
  export = esLintNoUnusedExpressions
}

declare module 'eslint-plugin-react/lib/rules/no-unescaped-entities' {
  import { Rule } from 'eslint'
  const reactNoUnescapedEntities: Rule.RuleModule
  export = reactNoUnescapedEntities
}
