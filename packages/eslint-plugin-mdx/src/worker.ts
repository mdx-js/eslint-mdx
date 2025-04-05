import { fromMarkdown, type Value } from 'mdast-util-from-markdown'
import { mdxFromMarkdown } from 'mdast-util-mdx'
import { mdxjs } from 'micromark-extension-mdxjs'
import { runAsWorker } from 'synckit'

runAsWorker((value: Value, isMdx: boolean) =>
  isMdx
    ? fromMarkdown(value, {
        extensions: [mdxjs()],
        mdastExtensions: [mdxFromMarkdown()],
      })
    : fromMarkdown(value),
)
