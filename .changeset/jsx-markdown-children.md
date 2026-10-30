---
"eslint-mdx": patch
---

fix: preserve markdown children of JSX elements

Markdown nodes such as links and emphasis were dropped when they appeared
inside JSX elements, making them look empty to rules like
`react/self-closing-comp`.
