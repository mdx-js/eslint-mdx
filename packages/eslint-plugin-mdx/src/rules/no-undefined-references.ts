import { collapseWhiteSpace } from 'collapse-white-space'
import type { Rule } from 'eslint'
import type { MDText } from 'eslint-mdx'
import { normalizeIdentifier } from 'micromark-util-normalize-identifier'

import { ANY_OPTION_SCHEMA, getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-undefined-references':
      | {
          allow?: Array<RegExp | string | { flags?: string; source: string }>
          allowShortcutLink?: boolean
        }
      | undefined
  }
}

type Range = number[]

const FULL_REFERENCE_LENGTH = 4

const labelFor = (before: string | undefined, after: string | undefined) => {
  if (before === '!') {
    return 'image'
  }

  return after === '^' ? 'footnote' : 'link'
}

export const noUndefinedReferences: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow undefined references' },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: { items: ANY_OPTION_SCHEMA, type: 'array' },
          allowShortcutLink: { type: 'boolean' },
        },
        type: 'object',
      },
    ],
  },
  create(context) {
    const config = getRuleConfig(context, 'no-undefined-references')

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
        allowStrings.add(normalizeIdentifier(value))
      } else {
        allowRegexes.push(new RegExp(value.source, value.flags ?? 'i'))
      }
    }

    const definitions = new Set<string>()
    const footnoteDefinitions = new Set<string>()

    const report = (range: Range, node: MDText) => {
      /* istanbul ignore if -- POC covers unmatched brackets */
      if (range.length === 1) {
        return
      }

      // `[x][` has no destination yet.
      /* istanbul ignore if -- POC covers collapsed references */
      if (range.length === 3) {
        /* istanbul ignore next -- POC covers collapsed references */
        range.length = 2
      }

      // Empty `[]` is regular text.
      if (range.length === 2 && range[0] + 2 === range[1]) {
        return
      }

      const startOffset = node.range[0]
      const before = sourceText[startOffset + range[0] - 1]
      const after = sourceText[startOffset + range[0] + 1]
      const label = labelFor(before, after)
      const offset =
        range.length === FULL_REFERENCE_LENGTH && range[2] + 2 !== range[3]
          ? 2
          : 0
      let identifier = normalizeIdentifier(
        collapseWhiteSpace(
          sourceText.slice(
            startOffset + range[offset] + 1,
            startOffset + range[offset + 1] - 1,
          ),
          { style: 'html', trim: true },
        ),
      )
      let defined = definitions

      if (label === 'footnote') {
        if (identifier.includes(' ')) {
          return
        }

        defined = footnoteDefinitions
        identifier = identifier.slice(1)
      }

      if (
        (allowShortcutLink && range.length === 2) ||
        defined.has(identifier) ||
        allowStrings.has(identifier) ||
        allowRegexes.some(regex => regex.test(identifier))
      ) {
        return
      }

      context.report({
        loc: {
          end: context.sourceCode.getLocFromIndex(startOffset + range.at(-1)),
          start: context.sourceCode.getLocFromIndex(startOffset + range[0]),
        },
        message: `Unexpected reference to undefined definition, expected corresponding definition (\`${identifier.toLowerCase()}\`) for ${label === 'image' ? 'an' : 'a'} ${label} or escaped opening bracket (\`\\[\`) for regular text`,
      })
    }

    const scan = (value: string, node: MDText) => {
      const ranges: Range[] = []
      let index = 0

      while (index < value.length) {
        const char = value[index]

        switch (char) {
          case '[': {
            ranges.push([index])
            index++
            break
          }
          case '\\': {
            const next = value[index + 1]

            index++

            if (next === '[' || next === ']') {
              index++
            }

            break
          }
          case ']': {
            const range = ranges.at(-1)

            if (!range) {
              index++
            } else if (value[index + 1] === '[' && range.length !== 3) {
              index++
              range.push(index, index)
              index++
            } else {
              index++
              range.push(index)
              report(range, node)
              ranges.pop()
            }

            break
          }
          default: {
            index++
          }
        }
      }
    }

    return {
      MDDefinition(node) {
        definitions.add(normalizeIdentifier(node.identifier))
      },
      MDFootnoteDefinition(node) {
        footnoteDefinitions.add(normalizeIdentifier(node.identifier))
      },
      MDText(node: MDText) {
        scan(sourceText.slice(node.range[0], node.range[1]), node)
      },
    }
  },
}
