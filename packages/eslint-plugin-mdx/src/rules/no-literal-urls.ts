import type { Rule } from 'eslint'
import type { MDLink } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

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

        context.report({
          loc: node.loc,
          message: `Unexpected GFM autolink literal, expected regular autolink, add ${
            protocol ? `\`<${protocol}\`` : '`<`'
          } before and \`>\` after`,
        })
      },
    }
  },
}
