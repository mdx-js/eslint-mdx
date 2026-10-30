---
"eslint-mdx": patch
---

fix: emit empty MDX expressions

Top-level and nested comment-only or empty expressions (`{/* ... */}`, `{}`)
were skipped because their ESTree body is empty, leaving their brace tokens or
parent children without a corresponding node. Emit an `MDXFlowExpression` or
`MDXTextExpression` containing a `JSXEmptyExpression` instead.
