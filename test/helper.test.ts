import path from 'path'

import { getGlobals, getRangeByLoc, requirePkg } from 'eslint-plugin-mdx'

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

describe('getRangeByLoc', () => {
  it('should work as expected', () => {
    expect(
      getRangeByLoc(
        `
export const a = 1
export const a = 1
      `.trim(),
        {
          start: {
            line: 2,
            column: 8,
          },
          end: {
            line: 2,
            column: 15,
          },
        },
      ),
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    ).toEqual([26, 33])
  })
})
