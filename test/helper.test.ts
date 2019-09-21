import { getGlobals, requirePkg } from 'eslint-plugin-mdx'
import path from 'path'

describe('Helpers', () => {
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
