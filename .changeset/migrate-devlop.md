---
"eslint-mdx": patch
---

chore: migrate to `devlop`

Replace `node:assert` with [`devlop`](https://github.com/wooorm/devlop) so development-only assertions are stripped in production builds.

Closes [#568](https://github.com/mdx-js/eslint-mdx/issues/568).
