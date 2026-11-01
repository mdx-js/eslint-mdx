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
