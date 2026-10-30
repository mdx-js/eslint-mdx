---
"eslint-plugin-mdx": patch
---

fix: only apply remark fixes to the reported message range

A remark fix rewrites the whole document, so unrelated formatting changes could
conflict with `prettier/prettier` and produce circular fixes. Only expose the
fix when the changed text overlaps the reported message.

Closes [#491](https://github.com/mdx-js/eslint-mdx/issues/491).
