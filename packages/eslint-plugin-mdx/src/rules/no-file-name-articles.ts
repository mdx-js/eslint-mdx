import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-file-name-articles': never
  }
}

export const noFileNameArticles: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow articles at the start of file names',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-file-name-articles')

    if (!config) {
      return {}
    }

    const stem = path.basename(context.filename, path.extname(context.filename))
    const match = /^(?:the|teh|an?)\b/iu.exec(stem)

    if (match) {
      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message: `Unexpected file name starting with \`${match[0]}\`, remove it`,
      })
    }

    return {}
  },
}
