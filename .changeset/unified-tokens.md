---
"eslint-mdx": minor
---

feat: use micromark token types directly

Generate markdown and MDX structural tokens from the same micromark parse
used for the mdast tree, map MDX JSX/expression events to ESLint token types,
and merge them with acorn's JavaScript tokens. Markdown token types now use
the original micromark labels.

This relies on ESLint supporting custom token types; until
[eslint/eslint#21465](https://github.com/eslint/eslint/issues/21465) lands, the
repository carries a temporary type patch.
