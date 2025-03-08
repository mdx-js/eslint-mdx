import type { fromMarkdown as fromMarkdown_ } from 'mdast-util-from-markdown'
import { createSyncFn } from 'synckit'

export const fromMarkdown = createSyncFn(
  require.resolve('./worker'),
) as typeof fromMarkdown_
