import path from 'path'

import { arrayify } from 'eslint-mdx'
import { getGlobals, getShortLang, requirePkg } from 'eslint-plugin-mdx'

describe('Helpers', () => {
  it('should arrayify items correctly', () => {
    expect(arrayify([])).toEqual([])
    expect(arrayify(1, 2)).toEqual([1, 2])
    expect(arrayify(1, 2, null)).toEqual([1, 2])
    expect(arrayify([1, 2], [1, 2])).toEqual([1, 2, 1, 2])
  })

  it('should short lang for filename correctly', () => {
    expect(getShortLang('1.Markdown')).toBe('md')
    expect(getShortLang('2.Markdown', false)).toBe('Markdown')
    expect(getShortLang('3.Markdown', { Markdown: 'mkdn' })).toBe('mkdn')
    expect(getShortLang('4.Markdown', { markdown: 'mkdn' })).toBe('mkdn')
  })

  it('should resolve globals correctly', () => {
    expect(getGlobals({})).toEqual({})
    expect(getGlobals(['a', 'b'])).toEqual({
      a: false,
      b: false,
    })
  })

  it('should resolve package correctly', () => {
    expect(requirePkg('@1stg/config', 'husky')).toBeDefined()
    expect(requirePkg('lint', 'remark')).toBeDefined()
    expect(requirePkg('remark-parse', 'non existed')).toBeDefined()
    expect(
      requirePkg('./.eslintrc', 'non existed', path.resolve('package.json')),
    ).toBeDefined()
  })

  it('should throw on non existed package', () =>
    expect(() => requirePkg('@1stg/config', 'unexpected-')).toThrow())
})
