---
"eslint-mdx": minor
---

feat: use micromark token types directly

Generate markdown and MDX structural tokens from the same micromark parse
used for the mdast tree, map MDX JSX/expression events to ESLint token types,
and merge them with acorn's JavaScript tokens. Markdown token types now use
the original micromark labels; JSX text keeps using `JSXText` for compatibility.
