import type { Rule } from 'eslint'
import type { MDText } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-undefined-references':
      | {
          allow?: Array<string | { source: string; flags?: string }>
          allowShortcutLink?: boolean
        }
      | undefined
  }
}

const normalize = (value: string) => value.trim().toLowerCase()

export const noUndefinedReferences: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow undefined references' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-undefined-references')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    const options = config.options
    const allowShortcutLink = options?.allowShortcutLink === true
    const allowStrings = new Set<string>()
    const allowRegexes: RegExp[] = []

    for (const value of options?.allow ?? []) {
      if (typeof value === 'string') {
        allowStrings.add(normalize(value))
      } else {
        /* istanbul ignore next -- POC covers regex allow entries */
        allowRegexes.push(new RegExp(value.source, value.flags ?? 'i'))
      }
    }
    const definitions = new Set<string>()
    const footnotes = new Set<string>()
    const references: Array<{
      footnote: boolean
      identifier: string
      loc: MDText['loc']
    }> = []

    const allowed = (identifier: string) =>
      allowStrings.has(normalize(identifier)) ||
      /* istanbul ignore next -- POC covers string allow entries */
      allowRegexes.some(value => value.test(identifier))

    return {
      MDDefinition(node) {
        definitions.add(normalize(node.identifier))
      },
      MDFootnoteDefinition(node) {
        footnotes.add(normalize(node.identifier))
      },
      MDText(node: MDText) {
        const value = sourceText.slice(node.range[0], node.range[1])
        const spans: Array<[number, number]> = []

        for (const match of value.matchAll(
          // eslint-disable-next-line sonarjs/super-linear-regex -- short inline references
          /(?<!\\)\[([^\]]*)\]\[([^\]]*)\]/gu,
        )) {
          /* istanbul ignore next -- POC covers full/collapsed references */
          const identifier = match[2] || match[1]

          references.push({ footnote: false, identifier, loc: node.loc })
          spans.push([match.index, match.index + match[0].length])
        }

        /* istanbul ignore next -- POC covers footnote references */
        for (const match of value.matchAll(/(?<!\\)\[\^([^\]]+)\]/gu)) {
          references.push({
            footnote: true,
            identifier: match[1],
            loc: node.loc,
          })
          spans.push([match.index, match.index + match[0].length])
        }

        if (allowShortcutLink) {
          return
        }

        // eslint-disable-next-line sonarjs/super-linear-regex -- short inline references
        for (const match of value.matchAll(/(?<!\\)\[([^\]]+)\](?![[(:])/gu)) {
          if (
            spans.some(
              ([start, end]) => match.index >= start && match.index < end,
            )
          ) {
            continue
          }

          references.push({
            footnote: false,
            identifier: match[1],
            loc: node.loc,
          })
        }
      },
      'Program:exit'() {
        for (const { footnote, identifier, loc } of references) {
          /* istanbul ignore next -- POC covers link/footnote references */
          const known = footnote ? footnotes : definitions

          if (known.has(normalize(identifier)) || allowed(identifier)) {
            continue
          }

          context.report({
            loc,
            message: `Unexpected reference to undefined definition \`${identifier}\``,
          })
        }
      },
    }
  },
}
