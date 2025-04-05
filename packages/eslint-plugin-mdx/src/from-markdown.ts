import type { Root } from 'mdast'
import type { Value } from 'mdast-util-from-markdown'
import { createSyncFn } from 'synckit'

import { cjsRequire } from './helpers.js'

export const fromMarkdown = createSyncFn<
  (value: Value, isMdx: boolean) => Root
>(cjsRequire.resolve('./worker.js'))
