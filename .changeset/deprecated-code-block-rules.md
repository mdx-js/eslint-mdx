---
"eslint-plugin-mdx": patch
---

fix: stop naming the deprecated formatting rules that ESLint no longer has

`eol-last` and `padded-blocks` were deprecated in ESLint v8.53.0 in favour of
`@stylistic/eslint-plugin` and are removed in v11. The code blocks config now
reads the installed ESLint version and keeps switching both rules off until the
version that removes them, so an ESLint 8 or 10 user keeps the same output and
a future ESLint does not see a rule name it cannot resolve.

`eol-last` stays muted for the virtual code block files by the Markdown
processor, which is where the rule would otherwise fire.

Closes [#601](https://github.com/mdx-js/eslint-mdx/issues/601).
