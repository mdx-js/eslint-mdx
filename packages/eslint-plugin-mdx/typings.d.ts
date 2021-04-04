declare module 'eslint-plugin-markdown' {
  import type { Linter } from 'eslint'

  export const processors: {
    markdown: Linter.Processor<Linter.ProcessorFile>
  }
}

declare module 'remark-mdx' {
  import type * as unified from 'unified'
  const mdx: unified.Attacher
  export = mdx
}
