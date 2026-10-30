---
"eslint-mdx": patch
---

fix: preserve import specifier positions after leading whitespace

Acorn reuses the same identifier node for shorthand imports such as
`import { Foo }`, so the position fixer visited it twice and shifted its range.
Use the import specifier's own position instead.
