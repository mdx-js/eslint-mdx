import {
  deprecatedCodeBlockRules,
  codeBlocks,
} from '../packages/eslint-plugin-mdx/src/configs/code-blocks.js'

describe('deprecatedCodeBlockRules', () => {
  it('should switch the rules off while ESLint still has them', () => {
    expect(deprecatedCodeBlockRules('8.53.0')).toEqual({
      'eol-last': 'off',
      'padded-blocks': 'off',
    })
    // Deprecated, but still present, in every version before v11.
    expect(deprecatedCodeBlockRules('10.13.0')).toEqual({
      'eol-last': 'off',
      'padded-blocks': 'off',
    })
  })

  it('should drop them on the version that removed them', () => {
    expect(deprecatedCodeBlockRules('11.0.0')).toEqual({})
    expect(deprecatedCodeBlockRules('12.1.3')).toEqual({})
  })

  it('should keep them when the version is unreadable', () => {
    // Without a version there is nothing to prove the rules are gone, and
    // naming a rule ESLint has is harmless, so the safe side is to keep them.
    expect(deprecatedCodeBlockRules('')).toEqual({
      'eol-last': 'off',
      'padded-blocks': 'off',
    })
  })
})

describe('codeBlocks', () => {
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
