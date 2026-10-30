---
"eslint-mdx": patch
---

fix: expose micromark token types for markdown

Generate lexical tokens for markdown markers from micromark events instead of
inventing JSX text tokens. This gives fixers accurate boundaries for headings,
lists, blockquotes, emphasis and other markdown syntax.
