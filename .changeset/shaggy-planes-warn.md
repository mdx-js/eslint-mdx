---
"eslint-mdx": minor
"eslint-plugin-mdx": minor
---

feat: the new version is ESM primary, while commonjs is still supported.

ESM migration:

```ts
// before
import eslintMdx from "eslint-mdx"
import eslintPluginMdx from "eslint-plugin-mdx"
```

```ts
// after
import * as eslintMdx from "eslint-mdx"
import * as eslintPluginMdx from "eslint-plugin-mdx"
```
