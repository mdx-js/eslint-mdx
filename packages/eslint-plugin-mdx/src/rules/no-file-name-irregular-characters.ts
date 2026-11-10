import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-file-name-irregular-characters': RegExp | string | undefined
  }
}

export const noFileNameIrregularCharacters: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow irregular characters in file names',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(
      context.sourceCode,
      'no-file-name-irregular-characters',
    )

    if (!config) {
      return {}
    }

    /* istanbul ignore next -- POC covers the default option */
    /* eslint-disable sonarjs/no-nested-conditional */
    const expected =
      config.options == null
        ? /[^-.\dA-Za-z]/u
        : typeof config.options === 'string'
          ? new RegExp(`[^${config.options}]`, 'u')
          : config.options
    /* eslint-enable sonarjs/no-nested-conditional */
    const stem = path.basename(context.filename, path.extname(context.filename))
    const match = expected.exec(stem)

    if (match) {
      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message: `Unexpected character \`${match[0]}\` in file name`,
      })
    }

    return {}
  },
}
