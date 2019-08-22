import path from 'path'

import { requirePkg } from 'eslint-plugin-mdx'

describe('Helpers', () => {
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
