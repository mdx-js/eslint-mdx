---
"eslint-mdx": patch
---

fix: wrap MDX expressions in `JSXExpressionContainer`

Flow expressions inside JSX children were emitted as raw expressions and used
the parent element range. They are now wrapped in `JSXExpressionContainer`
nodes with their own range; both flow and text expression containers now use the
expression's own range.

Closes [#628](https://github.com/mdx-js/eslint-mdx/issues/628).
