---
"eslint-mdx": minor
---

feat: add ESTree nodes for MDX content

Add `MDXParagraph`, `MDXText`, `MDXList`, `MDXListItem`, `MDXBlockquote`,
`MDXEmphasis`, `MDXStrong`, `MDXInlineCode`, `MDXLink`, `MDXImage`, `MDXBreak`
and `MDXThematicBreak` nodes with visitor keys. Restore whitespace `JSXText`
tokens inside JSX elements so the AST body and tokens stay aligned.

Refs [#503](https://github.com/mdx-js/eslint-mdx/issues/503).
