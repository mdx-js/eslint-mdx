import path from 'node:path'

import type { Rule } from 'eslint'
import type { MDLink } from 'eslint-mdx'
import { DEFAULT_EXTENSIONS, arrayify } from 'eslint-mdx'

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
    const { extensions } = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      ...context.parserOptions,
      ...context.languageOptions?.parserOptions,
    } as { extensions?: string[] | string }
    const isMdxFile = [...DEFAULT_EXTENSIONS, ...arrayify(extensions)].includes(
      path.extname(context.filename),
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

        const expectedKind = isMdxFile ? 'regular link' : 'regular autolink'
        const marker = protocol ?? ''
        const suggestion = isMdxFile
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
