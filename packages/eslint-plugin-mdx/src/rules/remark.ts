// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../typings.d.ts" />

import remarkStringify from 'remark-stringify'
import unified, { Processor } from 'unified'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'

import { RemarkConfig } from './types'

import cosmiconfig, { Explorer } from 'cosmiconfig'
import { Rule } from 'eslint'

let remarkConfig: Explorer
let remarkProcessor: Processor

const getRemarkProcessor = (searchFrom?: string) => {
  if (!remarkConfig) {
    remarkConfig = cosmiconfig('remark', {
      packageProp: 'remarkConfig',
    })
  }

  if (!remarkProcessor) {
    remarkProcessor = unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkMdx)
      .freeze()
  }

  /* istanbul ignore next */
  const { plugins = [], settings }: Partial<RemarkConfig> =
    remarkConfig.searchSync(searchFrom).config || {}

  return plugins.reduce((remarkProcessor, pluginWithSettings) => {
    const [plugin, ...pluginSettings] = Array.isArray(pluginWithSettings)
      ? pluginWithSettings
      : [pluginWithSettings]
    return remarkProcessor.use(
      /* istanbul ignore next */
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      typeof plugin === 'string' ? require(plugin) : plugin,
      ...pluginSettings,
    )
  }, remarkProcessor().use({ settings }))
}

export const remark: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Linter integration with remark plugins',
      category: 'Stylistic Issues',
      recommended: true,
    },
    messages: {
      remarkReport: '{{ source }}:{{ ruleId }} - {{ reason }}',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    return {
      Program(node) {
        const file = getRemarkProcessor(context.getFilename()).processSync(
          sourceCode.getText(node),
        )
        const content = file.toString()
        let fixed = false
        file.messages.forEach(
          ({ source, reason, ruleId, location: { start, end } }) =>
            context.report({
              messageId: 'remarkReport',
              data: {
                reason,
                source,
                ruleId,
              },
              loc: {
                // ! eslint ast column is 0-indexed, but unified is 1-indexed
                start: {
                  ...start,
                  column: start.column - 1,
                },
                end: {
                  ...end,
                  column: end.column - 1,
                },
              },
              node,
              fix(fixer) {
                if (fixed) {
                  return null
                }
                fixed = true
                return fixer.replaceTextRange([0, content.length], content)
              },
            }),
        )
      },
    }
  },
}
