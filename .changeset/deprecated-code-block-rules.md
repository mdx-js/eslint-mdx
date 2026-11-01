---
"eslint-plugin-mdx": patch
---

fix: mute the code block rules under their @stylistic names too

`eol-last` and `padded-blocks` were deprecated in ESLint v8.53.0 in favour of
`@stylistic/eslint-plugin`, which carries them with its own prefix. The code
blocks config switches both off, and now also switches off
`@stylistic/eol-last` and `@stylistic/padded-blocks`, so the examples stay muted
for users who run the plugin.

The deprecated entries stay: a rule set to `off` that the installed ESLint no
longer has is bypassed rather than resolved, so they are inert on the version
that removes them and still mute the rule on the versions that have it.

Closes [#601](https://github.com/mdx-js/eslint-mdx/issues/601).
