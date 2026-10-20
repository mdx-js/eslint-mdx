---
"eslint-mdx": patch
---

fix: do not report `no-unused-expressions` for MDX text expressions

Add an `mdx/no-unused-expressions` rule that ignores expressions written in MDX
content while still reporting unused expressions in JavaScript inside MDX, such
as inside an exported function. The bundled configs use this rule instead of the
core and TypeScript ESLint variants.

Closes [#581](https://github.com/mdx-js/eslint-mdx/issues/581).
