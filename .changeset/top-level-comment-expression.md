---
"eslint-mdx": patch
---

fix: emit top-level empty MDX expressions

Top-level comment-only or empty expressions (`{/* ... */}`, `{}`) were skipped
because their ESTree body is empty, leaving their brace tokens without a body
node. Emit an `MDXFlowExpression` containing a `JSXEmptyExpression` instead.
