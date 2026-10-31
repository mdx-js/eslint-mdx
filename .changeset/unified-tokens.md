---
"eslint-mdx": minor
---

feat: unify token generation with micromark

Generate markdown and MDX structural tokens from the same micromark parse
used for the mdast tree, map them to ESLint-compatible token types, and merge
them with acorn's JavaScript tokens.
This removes the hand-written `restoreTokens` logic and keeps token ranges
aligned across markdown, JSX, expressions and ESM.
