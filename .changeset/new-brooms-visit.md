---
"eslint-plugin-mdx": patch
---

fix: `undefined` `place` in vFile message causes TypeError

Many `remark-lint` errors do not set a place variable in the vFile
message. This code should accept `undefined` for this field.

fixes #520
