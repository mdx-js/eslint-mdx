declare module 'eslint/lib/rules/no-unused-expressions' {
  import { Rule } from 'eslint'
  const noUnUsedExpressions: Rule.RuleModule
  export = noUnUsedExpressions
}

declare module 'eslint-plugin-react/lib/rules/no-unescaped-entities' {
  import { Rule } from 'eslint'
  const reactNoUnEscapedEntities: Rule.RuleModule
  export = reactNoUnEscapedEntities
}
