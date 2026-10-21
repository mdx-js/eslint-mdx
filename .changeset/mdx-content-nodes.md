---
"eslint-mdx": minor
---

feat: add ESTree nodes for Markdown content

Add `MDParagraph`, `MDText`, `MDList`, `MDListItem`, `MDBlockquote`,
`MDEmphasis`, `MDStrong`, `MDInlineCode`, `MDLink`, `MDImage`, `MDBreak`,
`MDThematicBreak`, `MDDefinition`, `MDDelete`, `MDFootnoteDefinition`,
`MDFootnoteReference`, `MDImageReference`, `MDInlineMath`, `MDLinkReference`,
`MDMath`, `MDTable`, `MDTableCell`, `MDTableRow`, `MDToml` and `MDYaml`
nodes with visitor keys. Restore whitespace `JSXText` tokens inside JSX
elements so the AST body and tokens stay aligned.

Closes [#503](https://github.com/mdx-js/eslint-mdx/issues/503).
