# Native remark-lint rules

This page documents the native ESLint implementations of the mapped [remark-lint](https://github.com/remarkjs/remark-lint) rules.

> These rules are opt-in. `base` / `flat` keep using `mdx/remark`; extend `plugin:mdx/native` or add `mdx.configs.native` to enable the native rules. They are not yet a promise of stable parity with remark-lint.

## Options

- By default, a native rule reads its options from the resolved remark config.
- An ESLint positional option overrides the remark option:

  ```json
  {
    "rules": {
      "mdx/maximum-heading-length": ["warn", 60]
    }
  }
  ```

- Optionless rules currently need a remark config entry to be activated.
- Function-valued options cannot cross the worker boundary, so the remark plugin is kept and `mdx/remark` reports those rules instead.
- `remark-lint-file-extension` is force-disabled by the worker when native rules are active; the native `mdx/file-extension` rule handles it.
- Omit the `native` config to keep the remark fallback path. This is the migration rollback path.

```js
// legacy
const legacy = { extends: ['plugin:mdx/base', 'plugin:mdx/native'] }

// flat
const flat = [mdx.configs.flat, mdx.configs.native]
```

## Rules

| Native rule                             | remark-lint implementation                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mdx/emphasis-marker`                   | [`remark-lint-emphasis-marker`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-emphasis-marker)                                     |
| `mdx/final-newline`                     | [`remark-lint-final-newline`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-final-newline)                                         |
| `mdx/fenced-code-marker`                | [`remark-lint-fenced-code-marker`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-fenced-code-marker)                               |
| `mdx/heading-increment`                 | [`remark-lint-heading-increment`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-heading-increment)                                 |
| `mdx/heading-style`                     | [`remark-lint-heading-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-heading-style)                                         |
| `mdx/definition-case`                   | [`remark-lint-definition-case`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-definition-case)                                     |
| `mdx/definition-spacing`                | [`remark-lint-definition-spacing`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-definition-spacing)                               |
| `mdx/no-consecutive-blank-lines`        | [`remark-lint-no-consecutive-blank-lines`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-consecutive-blank-lines)               |
| `mdx/no-duplicate-definitions`          | [`remark-lint-no-duplicate-definitions`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-duplicate-definitions)                   |
| `mdx/no-duplicate-headings`             | [`remark-lint-no-duplicate-headings`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-duplicate-headings)                         |
| `mdx/no-duplicate-headings-in-section`  | [`remark-lint-no-duplicate-headings-in-section`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-duplicate-headings-in-section)   |
| `mdx/no-file-name-articles`             | [`remark-lint-no-file-name-articles`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-file-name-articles)                         |
| `mdx/no-file-name-consecutive-dashes`   | [`remark-lint-no-file-name-consecutive-dashes`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-file-name-consecutive-dashes)     |
| `mdx/no-file-name-irregular-characters` | [`remark-lint-no-file-name-irregular-characters`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-file-name-irregular-characters) |
| `mdx/no-file-name-mixed-case`           | [`remark-lint-no-file-name-mixed-case`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-file-name-mixed-case)                     |
| `mdx/no-file-name-outer-dashes`         | [`remark-lint-no-file-name-outer-dashes`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-file-name-outer-dashes)                 |
| `mdx/no-emphasis-as-heading`            | [`remark-lint-no-emphasis-as-heading`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-emphasis-as-heading)                       |
| `mdx/maximum-heading-length`            | [`remark-lint-maximum-heading-length`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-maximum-heading-length)                       |
| `mdx/no-heading-content-indent`         | [`remark-lint-no-heading-content-indent`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-heading-content-indent)                 |
| `mdx/link-title-style`                  | [`remark-lint-link-title-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-link-title-style)                                   |
| `mdx/no-heading-punctuation`            | [`remark-lint-no-heading-punctuation`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-heading-punctuation)                       |
| `mdx/ordered-list-marker-style`         | [`remark-lint-ordered-list-marker-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-ordered-list-marker-style)                 |
| `mdx/no-literal-urls`                   | [`remark-lint-no-literal-urls`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-literal-urls)                                     |
| `mdx/no-multiple-toplevel-headings`     | [`remark-lint-no-multiple-toplevel-headings`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-multiple-toplevel-headings)         |
| `mdx/no-unused-definitions`             | [`remark-lint-no-unused-definitions`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-unused-definitions)                         |
| `mdx/rule-style`                        | [`remark-lint-rule-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-rule-style)                                               |
| `mdx/no-shell-dollars`                  | [`remark-lint-no-shell-dollars`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-shell-dollars)                                   |
| `mdx/no-table-indentation`              | [`remark-lint-no-table-indentation`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-table-indentation)                           |
| `mdx/no-shortcut-reference-image`       | [`remark-lint-no-shortcut-reference-image`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-shortcut-reference-image)             |
| `mdx/no-shortcut-reference-link`        | [`remark-lint-no-shortcut-reference-link`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-shortcut-reference-link)               |
| `mdx/strong-marker`                     | [`remark-lint-strong-marker`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-strong-marker)                                         |
| `mdx/unordered-list-marker-style`       | [`remark-lint-unordered-list-marker-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-unordered-list-marker-style)             |
| `mdx/blockquote-indentation`            | [`remark-lint-blockquote-indentation`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-blockquote-indentation)                       |
| `mdx/checkbox-character-style`          | [`remark-lint-checkbox-character-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-checkbox-character-style)                   |
| `mdx/code-block-style`                  | [`remark-lint-code-block-style`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-code-block-style)                                   |
| `mdx/fenced-code-flag`                  | [`remark-lint-fenced-code-flag`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-fenced-code-flag)                                   |
| `mdx/file-extension`                    | [`remark-lint-file-extension`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-file-extension)                                       |
| `mdx/final-definition`                  | [`remark-lint-final-definition`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-final-definition)                                   |
| `mdx/hard-break-spaces`                 | [`remark-lint-hard-break-spaces`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-hard-break-spaces)                                 |
| `mdx/list-item-bullet-indent`           | [`remark-lint-list-item-bullet-indent`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-list-item-bullet-indent)                     |
| `mdx/list-item-content-indent`          | [`remark-lint-list-item-content-indent`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-list-item-content-indent)                   |
| `mdx/list-item-indent`                  | [`remark-lint-list-item-indent`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-list-item-indent)                                   |
| `mdx/list-item-spacing`                 | [`remark-lint-list-item-spacing`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-list-item-spacing)                                 |
| `mdx/maximum-line-length`               | [`remark-lint-maximum-line-length`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-maximum-line-length)                             |
| `mdx/no-blockquote-without-marker`      | [`remark-lint-no-blockquote-without-marker`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-blockquote-without-marker)           |
| `mdx/no-undefined-references`           | [`remark-lint-no-undefined-references`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-no-undefined-references)                     |
| `mdx/ordered-list-marker-value`         | [`remark-lint-ordered-list-marker-value`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-ordered-list-marker-value)                 |
| `mdx/table-cell-padding`                | [`remark-lint-table-cell-padding`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-table-cell-padding)                               |
| `mdx/table-pipe-alignment`              | [`remark-lint-table-pipe-alignment`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-table-pipe-alignment)                           |
| `mdx/table-pipes`                       | [`remark-lint-table-pipes`](https://github.com/remarkjs/remark-lint/tree/main/packages/remark-lint-table-pipes)                                             |

The `mdx/remark` rule remains the fallback for remark plugins that are not mapped to a native rule, or whose options cannot be represented in the native path.

## Validation

The differential harness compares native rules against remark-lint on the shared fixture corpus. A small set of known semantic differences is tracked in the test until fixed; see [the tracking issue](https://github.com/mdx-js/eslint-mdx/issues/656).
