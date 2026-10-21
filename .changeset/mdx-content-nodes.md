---
"eslint-mdx": minor
---

feat: add ESTree nodes for MDX content

Add `MDXParagraph`, `MDXText`, `MDXList`, `MDXListItem`, `MDXBlockquote`,
`MDXEmphasis`, `MDXStrong`, `MDXInlineCode`, `MDXLink`, `MDXImage`, `MDXBreak`,
`MDXThematicBreak`, `MDXDefinition`, `MDXDelete`, `MDXFootnoteDefinition`,
`MDXFootnoteReference`, `MDXImageReference`, `MDXInlineMath`, `MDXLinkReference`,
`MDXMath`, `MDXTable`, `MDXTableCell`, `MDXTableRow`, `MDXToml` and `MDXYaml`
nodes with visitor keys. Restore whitespace `JSXText` tokens inside JSX
elements so the AST body and tokens stay aligned.

Closes [#503](https://github.com/mdx-js/eslint-mdx/issues/503).
