---
"eslint-mdx": patch
---

fix: surface worker failures instead of hanging forever

Upgrade `synckit` to `^0.12.3` so a worker failure is reported to the caller
instead of leaving ESLint blocked in `Atomics.wait()`, which made lint runs over
large projects appear to hang with no diagnostics.

Closes [#605](https://github.com/mdx-js/eslint-mdx/issues/605).
