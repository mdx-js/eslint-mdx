---
"eslint-plugin-mdx": patch
---

fix: only apply remark fixes to the reported message range

A remark fix used to rewrite the whole document, so unrelated formatting changes
could conflict with `prettier/prettier` and produce circular fixes. Apply only the
differences that overlap the reported message, as localized fixes.

Closes [#491](https://github.com/mdx-js/eslint-mdx/issues/491).
