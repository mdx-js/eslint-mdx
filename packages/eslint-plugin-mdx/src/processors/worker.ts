import { loadEsmModule } from 'eslint-mdx'
import type * as _ from 'mdast-util-from-markdown'
import { runAsWorker } from 'synckit'

let fromMarkdown: typeof _.fromMarkdown

runAsWorker(async (...args: Parameters<typeof fromMarkdown>) => {
  if (!fromMarkdown) {
    ;({ fromMarkdown } = await loadEsmModule<typeof _>(
      'mdast-util-from-markdown',
    ))
  }
  return fromMarkdown(...args)
})
