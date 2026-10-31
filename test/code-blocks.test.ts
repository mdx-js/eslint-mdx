import type { Linter } from 'eslint'

import { codeBlocks, flatCodeBlocks } from 'eslint-plugin-mdx'

const rules: Linter.RulesRecord = {
  'eol-last': 'off',
  '@stylistic/eol-last': 'off',
  'no-undef': 'off',
  'no-unused-expressions': 'off',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'padded-blocks': 'off',
  '@stylistic/padded-blocks': 'off',
  strict: 'off',
  'unicode-bom': 'off',
}

describe('codeBlocks', () => {
  it('should mute the code block rules under both their names', () => {
    expect(codeBlocks.rules).toEqual(rules)
  })
})

describe('flatCodeBlocks', () => {
  it('should share the code block rules', () => {
    expect(flatCodeBlocks.rules).toEqual(codeBlocks.rules)
  })
})
