import type { Rule } from 'eslint'
import type { MDHeading } from 'eslint-mdx'
import type { JSXElement } from 'estree-jsx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'maximum-heading-length':
      number | { size?: number | null; stringLength?: unknown } | undefined
  }
}

interface TextNode {
  alt?: string | null
  children?: TextNode[]
  expression?: { range?: [number, number] }
  type: string
  value?: string | null
}

export const maximumHeadingLength: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce a maximum heading length',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'maximum-heading-length')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()
    /* istanbul ignore next -- POC covers the numeric size option */
    const size =
      typeof config.options === 'object' && config.options !== null
        ? config.options.size
        : config.options
    const expected = typeof size === 'number' ? size : 60

    const getText = (node: TextNode): string => {
      if (node.type === 'MDHtml') {
        return ''
      }

      if (node.value != null) {
        return node.value
      }

      if (node.alt) {
        return node.alt
      }

      if (
        node.type === 'MDXTextExpression' ||
        node.type === 'JSXExpressionContainer'
      ) {
        const range = node.expression?.range

        /* istanbul ignore next -- parsed expression nodes have ranges */
        return range ? sourceText.slice(range[0], range[1]) : ''
      }

      return (node.children ?? []).map(child => getText(child)).join('')
    }

    const report = (node: JSXElement | MDHeading) => {
      const actual = [...getText(node)].length

      if (actual > expected) {
        context.report({
          loc: node.loc,
          message: `Unexpected \`${actual}\` characters in heading, expected at most \`${expected}\` characters`,
        })
      }
    }

    return {
      MDHeading(node: MDHeading) {
        report(node)
      },
      JSXElement(node: JSXElement) {
        const name = node.openingElement.name

        if (name.type !== 'JSXIdentifier' || !/^h[1-6]$/u.test(name.name)) {
          return
        }

        report(node)
      },
    }
  },
}
