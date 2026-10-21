---
"eslint-mdx": minor
---

feat: add `MDXFlowExpression` and `MDXTextExpression` nodes

MDX content expressions are no longer emitted as top-level `ExpressionStatement`
nodes, so `no-unused-expressions` no longer reports them. The new nodes expose
their `expression` and are traversed via the extended visitor keys.

Closes [#581](https://github.com/mdx-js/eslint-mdx/issues/581).
