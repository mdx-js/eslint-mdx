declare module 'eslint/lib/rules/no-unused-expressions' {
  import type { Rule } from 'eslint'
  const esLintNoUnusedExpressions: Rule.RuleModule
  export = esLintNoUnusedExpressions
}

declare module 'eslint-plugin-react/lib/rules/no-unescaped-entities' {
  import type { Rule } from 'eslint'
  const reactNoUnescapedEntities: Rule.RuleModule
  export = reactNoUnescapedEntities
}

declare module 'remark-mdx' {
  import type * as unified from 'unified'
  const mdx: unified.Attacher
  export = mdx
}
