import path from 'node:path'

import type { Rule } from 'eslint'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'file-extension':
      | string[]
      | string
      | { allowExtensionless?: boolean; extensions?: string[] | string }
      | undefined
  }
}

export const fileExtension: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Enforce file extensions' },
    schema: [{ items: { type: 'string' }, type: 'array' }],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'file-extension')

    if (!config) {
      return {}
    }

    // type-coverage:ignore-next-line -- ESLint option typing
    const options = (context.options[0] ?? config.options) as
      | string[]
      | string
      | { allowExtensionless?: boolean; extensions?: string[] | string }
      | undefined
    let allowed: string[] | string | undefined

    /* eslint-disable-next-line unicorn-x/prefer-ternary -- clarity */
    if (Array.isArray(options) || typeof options === 'string') {
      allowed = options
    } else {
      allowed = options?.extensions ?? ['mdx', 'md']
    }

    /* istanbul ignore next -- POC covers array/string options */
    const expected = Array.isArray(allowed) ? allowed : [allowed]
    const extension = path.extname(context.filename).slice(1)
    /* istanbul ignore next -- POC covers object options */
    const allowExtensionless =
      typeof options === 'object' && !Array.isArray(options)
        ? options?.allowExtensionless !== false
        : true

    /* istanbul ignore next -- POC covers extension validation */
    const invalid = extension
      ? !expected.includes(extension)
      : !allowExtensionless

    /* istanbul ignore if -- POC covers file extension validation */
    if (invalid) {
      const actual = extension
        ? `Unexpected file extension \`${extension}\``
        : 'Unexpected missing file extension'
      const expectedText = expected.map(value => `\`${value}\``).join(', ')

      context.report({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
        message: `${actual}, expected ${expectedText}`,
      })
    }

    return {}
  },
}
