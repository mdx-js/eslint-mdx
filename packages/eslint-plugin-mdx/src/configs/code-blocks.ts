import type { Linter } from 'eslint'

export const codeBlocks = {
  parserOptions: {
    ecmaFeatures: {
      // Adding a "use strict" directive at the top of
      // every code block is tedious and distracting, so
      // opt into strict mode parsing without the
      // directive.
      impliedStrict: true,
    },
  },
  rules: {
    // ESLint deprecated `eol-last` and `padded-blocks` in v8.53.0 in favour of
    // @stylistic/eslint-plugin, which carries them under its own prefix, so both
    // names are switched off here. An entry naming a rule the installed ESLint
    // no longer has is bypassed while it is "off", and the @stylistic entries
    // keep the same rules muted for the users who run the plugin.
    'eol-last': 'off',
    '@stylistic/eol-last': 'off',

    // In code snippets and examples, these rules are often
    // counterproductive to clarity and brevity.
    'no-undef': 'off',
    'no-unused-expressions': 'off',
    'mdx/no-file-name-articles': 'off',
    'mdx/no-file-name-consecutive-dashes': 'off',
    'mdx/no-file-name-irregular-characters': 'off',
    'mdx/no-file-name-mixed-case': 'off',
    'mdx/no-file-name-outer-dashes': 'off',
    'mdx/blockquote-indentation': 'off',
    'mdx/checkbox-character-style': 'off',
    'mdx/code-block-style': 'off',
    'mdx/definition-case': 'off',
    'mdx/definition-spacing': 'off',
    'mdx/emphasis-marker': 'off',
    'mdx/fenced-code-flag': 'off',
    'mdx/fenced-code-marker': 'off',
    'mdx/final-definition': 'off',
    'mdx/final-newline': 'off',
    'mdx/hard-break-spaces': 'off',
    'mdx/heading-increment': 'off',
    'mdx/heading-style': 'off',
    'mdx/link-title-style': 'off',
    'mdx/list-item-bullet-indent': 'off',
    'mdx/list-item-content-indent': 'off',
    'mdx/list-item-indent': 'off',
    'mdx/list-item-spacing': 'off',
    'mdx/maximum-heading-length': 'off',
    'mdx/maximum-line-length': 'off',
    'mdx/no-blockquote-without-marker': 'off',
    'mdx/no-consecutive-blank-lines': 'off',
    'mdx/no-duplicate-definitions': 'off',
    'mdx/no-duplicate-headings-in-section': 'off',
    'mdx/no-duplicate-headings': 'off',
    'mdx/no-emphasis-as-heading': 'off',
    'mdx/no-heading-content-indent': 'off',
    'mdx/no-heading-punctuation': 'off',
    'mdx/no-literal-urls': 'off',
    'mdx/no-multiple-toplevel-headings': 'off',
    'mdx/no-shell-dollars': 'off',
    'mdx/no-shortcut-reference-image': 'off',
    'mdx/no-shortcut-reference-link': 'off',
    'mdx/no-table-indentation': 'off',
    'mdx/no-undefined-references': 'off',
    'mdx/no-unused-definitions': 'off',
    'mdx/ordered-list-marker-style': 'off',
    'mdx/ordered-list-marker-value': 'off',
    'mdx/rule-style': 'off',
    'mdx/strong-marker': 'off',
    'mdx/table-cell-padding': 'off',
    'mdx/table-pipe-alignment': 'off',
    'mdx/table-pipes': 'off',
    'mdx/unordered-list-marker-style': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'padded-blocks': 'off',
    '@stylistic/padded-blocks': 'off',

    // Adding a "use strict" directive at the top of every
    // code block is tedious and distracting. The config
    // opts into strict mode parsing without the directive.
    strict: 'off',

    // The processor will not receive a Unicode Byte Order
    // Mark from the Markdown parser.
    'unicode-bom': 'off',
  },
} satisfies Linter.LegacyConfig
