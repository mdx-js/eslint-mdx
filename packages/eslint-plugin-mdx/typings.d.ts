declare module 'remark-mdx' {
  import type * as unified from 'unified'
  const mdx: unified.Attacher
  export = mdx
}
