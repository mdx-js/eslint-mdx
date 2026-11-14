import type { Rule } from 'eslint'
import type { MDLink } from 'eslint-mdx'

import { getParserOptions, getRuleConfig, isMdxFile } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-literal-urls': never
  }
}

const defaultHttp = 'http://'
const defaultMailto = 'mailto:'

export const noLiteralUrls: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow literal URLs',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-literal-urls')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    const isMdx = isMdxFile(
      context.filename,
      getParserOptions(context).extensions,
    )

    return {
      MDLink(node: MDLink) {
        const start = node.range[0]
        const raw = sourceText.slice(start, node.range[1])

        if (raw.startsWith('[')) {
          return
        }

        let protocol: string | undefined

        switch (true) {
          case raw === node.url: {
            break
          }
          case defaultHttp + raw === node.url: {
            protocol = defaultHttp
            break
          }
          case defaultMailto + raw === node.url: {
            protocol = defaultMailto
            break
          }
          default: {
            return
          }
        }

        const expectedKind = isMdx ? 'regular link' : 'regular autolink'
        const marker = protocol ?? ''
        const suggestion = isMdx
          ? 'use `[text](url)` instead or escape it with `\\<`'
          : `add \`<${marker}\` before and \`>\` after`
        context.report({
          loc: node.loc,
          message: `Unexpected GFM autolink literal, expected ${expectedKind}, ${suggestion}`,
        })
      },
    }
  },
}
