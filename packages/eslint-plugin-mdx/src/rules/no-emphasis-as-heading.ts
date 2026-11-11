import type { Rule } from 'eslint'
import type { MDContentNode, MDParagraph } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'no-emphasis-as-heading': never
  }
}

const isParagraph = (node: MDContentNode | undefined) =>
  node?.type === 'MDParagraph'

export const noEmphasisAsHeading: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow emphasis used as a heading',
    },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context.sourceCode, 'no-emphasis-as-heading')

    if (!config) {
      return {}
    }

    return {
      MDParagraph(node: MDParagraph) {
        const parent = (
          node as MDParagraph & {
            parent?: {
              body?: MDContentNode[]
              children?: MDContentNode[]
            }
          }
        ).parent
        const children = parent?.children ?? parent?.body

        /* istanbul ignore if -- parser nodes have parents with children */
        if (!children) {
          return
        }

        const index = children.indexOf(node)
        const next = children[index + 1]

        if (!isParagraph(next)) {
          return
        }

        const [head] = node.children

        if (
          node.children.length !== 1 ||
          (head?.type !== 'MDEmphasis' && head?.type !== 'MDStrong')
        ) {
          return
        }

        context.report({
          loc: node.loc,
          message: `Unexpected ${head.type === 'MDStrong' ? 'strong' : 'emphasis'} introducing a section, expected a heading instead`,
        })
      },
    }
  },
}
