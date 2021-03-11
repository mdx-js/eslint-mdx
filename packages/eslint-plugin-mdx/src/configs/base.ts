import { Linter } from 'eslint'

export const base: Linter.Config = {
  parser: 'eslint-mdx',
  plugins: ['mdx'],
  processor: 'mdx/remark',
}
