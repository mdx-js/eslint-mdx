import { ESLint } from 'eslint'
import type { Linter } from 'eslint'

import { codeBlocks, flatCodeBlocks } from 'eslint-plugin-mdx'

// ESLint removed the deprecated formatting rules in this major version.
const ESLINT_WITHOUT_FORMATTING_RULES = 11
const removedFormattingRules =
  Number.parseInt(ESLint.version, 10) >= ESLINT_WITHOUT_FORMATTING_RULES

const rules: Linter.RulesRecord = {
  ...(removedFormattingRules
    ? {}
    : { 'eol-last': 'off', 'padded-blocks': 'off' }),

  'no-undef': 'off',
  'no-unused-expressions': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  strict: 'off',
  'unicode-bom': 'off',
}

describe('codeBlocks', () => {
  it(`should only name the deprecated rules while ESLint ${ESLint.version} has them`, () => {
    expect(codeBlocks.rules).toEqual(rules)
  })

  it('should keep the rules that are not deprecated', () => {
    expect(codeBlocks.rules).toMatchObject({
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      strict: 'off',
      'unicode-bom': 'off',
    })
  })
})

describe('flatCodeBlocks', () => {
  it('should share the code block rules', () => {
    expect(flatCodeBlocks.rules).toEqual(codeBlocks.rules)
  })
})
