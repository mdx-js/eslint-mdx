import type { fromMarkdown as fromMarkdown_ } from 'mdast-util-from-markdown'
import { createSyncFn } from 'synckit'

import { cjsRequire } from './helpers.js'

export const fromMarkdown = createSyncFn<typeof fromMarkdown_>(
  cjsRequire.resolve('./worker.js'),
)
