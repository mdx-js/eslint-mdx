import type { fromMarkdown as fromMarkdown_ } from 'mdast-util-from-markdown'
import { runAsWorker } from 'synckit'

let fromMarkdown: typeof fromMarkdown_

runAsWorker(async (...args: Parameters<typeof fromMarkdown>) => {
  if (!fromMarkdown) {
    ;({ fromMarkdown } = await import('mdast-util-from-markdown'))
  }
  return fromMarkdown(...args)
})
