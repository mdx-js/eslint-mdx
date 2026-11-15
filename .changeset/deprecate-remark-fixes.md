---
"eslint-plugin-mdx": patch
---

Deprecate the stringify-based autofixes from `mdx/remark`; enable the `native` config for targeted fixes. A one-time warning is emitted when a fallback fix is computed, and `deprecationWarnings: false` silences it.
