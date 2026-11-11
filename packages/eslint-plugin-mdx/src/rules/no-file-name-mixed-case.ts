import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-file-name-mixed-case': never
  }
}

export const noFileNameMixedCase: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow mixed case in file names',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-file-name-mixed-case')

    if (!config) {
      return {}
    }

    const stem = path.basename(context.filename, path.extname(context.filename))

    if (stem && stem !== stem.toLowerCase() && stem !== stem.toUpperCase()) {
      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message:
          'Unexpected mixed case in file name, expected either lowercase or uppercase',
      })
    }

    return {}
  },
}
