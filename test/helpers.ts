import { RuleTester } from 'eslint'

export function noop<T extends unknown[] = unknown[], R = unknown>(
  ..._args: T
): R {
  // eslint-disable-next-line unicorn/no-useless-undefined
  return undefined
}

export const parser = require.resolve('eslint-mdx')

export const ruleTester = new RuleTester()
