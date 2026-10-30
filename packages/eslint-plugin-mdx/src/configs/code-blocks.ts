import type { Linter } from 'eslint'

import { cjsRequire } from '../helpers.js'

// ESLint removed the deprecated formatting rules in this major version.
const ESLINT_WITHOUT_FORMATTING_RULES = 11

// The two formatting rules the config switched off for code blocks were
// deprecated in ESLint v8.53.0 in favour of @stylistic/eslint-plugin and are
// removed in v11. Naming a rule the installed ESLint does not have is an error,
// so the entries go away with the version that removed them.
export const deprecatedCodeBlockRules = (
  eslintVersion: string,
): Linter.RulesRecord => {
  // parseInt stops at the first dot, which is exactly the major version.
  const major = Number.parseInt(eslintVersion, 10)
  if (!Number.isNaN(major) && major >= ESLINT_WITHOUT_FORMATTING_RULES) {
    return {}
  }
  return {
    // The Markdown parser automatically trims trailing newlines from code
    // blocks.
    'eol-last': 'off',

    // In code snippets and examples, a padded block is often counterproductive.
    'padded-blocks': 'off',
  }
}

const installedEslintVersion = (): string => {
  /* istanbul ignore next */
  try {
    const manifest: { version?: string } = cjsRequire('eslint/package.json')
    return manifest.version ?? ''
  } catch {
    return ''
  }
}

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
    ...deprecatedCodeBlockRules(installedEslintVersion()),

    // In code snippets and examples, these rules are often
    // counterproductive to clarity and brevity.
    'no-undef': 'off',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // Adding a "use strict" directive at the top of every
    // code block is tedious and distracting. The config
    // opts into strict mode parsing without the directive.
    strict: 'off',

    // The processor will not receive a Unicode Byte Order
    // Mark from the Markdown parser.
    'unicode-bom': 'off',
  },
} satisfies Linter.LegacyConfig
