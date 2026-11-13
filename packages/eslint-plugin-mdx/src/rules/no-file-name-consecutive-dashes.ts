import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-file-name-consecutive-dashes': never
  }
}

export const noFileNameConsecutiveDashes: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow consecutive dashes in file names',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-file-name-consecutive-dashes')

    if (!config) {
      return {}
    }

    const stem = path.basename(context.filename, path.extname(context.filename))

    if (/-{2,}/u.test(stem)) {
      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message: 'Unexpected consecutive dashes in a file name, expected `-`',
      })
    }

    return {}
  },
}
