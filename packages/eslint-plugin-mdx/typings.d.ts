declare module 'remark-mdx' {
  import type * as unified from 'unified'

  const mdx: unified.Attacher
  export = mdx
}

declare module 'eslint/use-at-your-own-risk' {
  import type { Rule } from 'eslint'

  export const builtinRules: Map<string, Rule.RuleModule>
}
