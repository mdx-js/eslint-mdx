---
"eslint-mdx": patch
---

fix: avoid the `tslib` runtime dependency

Build with `rewriteRelativeImportExtensions: false` and use `.js`
extensions in source imports, so the compiled worker no longer imports
`__rewriteRelativeImportExtension` from `tslib`.
