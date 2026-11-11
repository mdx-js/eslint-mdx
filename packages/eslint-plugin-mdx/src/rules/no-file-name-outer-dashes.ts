import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-file-name-outer-dashes': never
  }
}

export const noFileNameOuterDashes: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow initial or final dashes in file names',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-file-name-outer-dashes',
    )

    if (!config) {
      return {}
    }

    const stem = path.basename(context.filename, path.extname(context.filename))

    if (/^-|-$/u.test(stem)) {
      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message:
          'Unexpected initial or final dashes in file name, expected dashes to join words',
      })
    }

    return {}
  },
}
