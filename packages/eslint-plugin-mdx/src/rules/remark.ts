// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../typings.d.ts" />

import path from 'path'

import remarkStringify from 'remark-stringify'
import unified, { Processor } from 'unified'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import vfile from 'vfile'
import { DEFAULT_EXTENSIONS } from 'eslint-mdx'

import { RemarkConfig } from './types'

import cosmiconfig, { Explorer, CosmiconfigResult } from 'cosmiconfig'
import { Rule } from 'eslint'

let remarkConfig: Explorer
let remarkProcessor: Processor

const getRemarkProcessor = (searchFrom: string, extname: string) => {
  if (!remarkConfig) {
    remarkConfig = cosmiconfig('remark', {
      packageProp: 'remarkConfig',
    })
  }

  if (!remarkProcessor) {
    remarkProcessor = unified()
      .use(remarkParse)
      .freeze()
  }

  /* istanbul ignore next */
  const { plugins = [], settings }: Partial<RemarkConfig> =
    (remarkConfig.searchSync(searchFrom) || ({} as CosmiconfigResult)).config ||
    {}

  // disable this rule automatically since we have a parser option `extensions`
  plugins.push(['remark-lint-file-extension', extname.slice(1)])

  return plugins
    .reduce(
      (remarkProcessor, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = Array.isArray(pluginWithSettings)
          ? pluginWithSettings
          : [pluginWithSettings]
        return remarkProcessor.use(
          /* istanbul ignore next */
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
          typeof plugin === 'string' ? require(plugin) : plugin,
          ...pluginSettings,
        )
      },
      remarkProcessor()
        .use({ settings })
        .use(remarkStringify)
        .use(remarkMdx),
    )
    .freeze()
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
    const filename = context.getFilename()
    const extname = path.extname(filename)
    const sourceCode = context.getSourceCode()
    const extensions = DEFAULT_EXTENSIONS.concat(
      context.parserOptions.extensions || [],
    )
    return {
      Program(node) {
        /* istanbul ignore if */
        if (!extensions.includes(extname)) {
          return
        }
        const sourceText = sourceCode.getText(node)
        const remarkProcessor = getRemarkProcessor(filename, extname)
        const file = remarkProcessor.processSync(
          vfile({
            path: filename,
            contents: sourceText,
          }),
        )
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
                /* istanbul ignore if */
                if (start.offset == null) {
                  return null
                }
                const range: [number, number] = [
                  start.offset,
                  /* istanbul ignore next */
                  end.offset == null ? start.offset + 1 : end.offset,
                ]
                const partialText = sourceText.slice(...range)
                const fixed = remarkProcessor
                  .processSync(partialText)
                  .toString()
                return fixer.replaceTextRange(
                  range,
                  /* istanbul ignore next */
                  partialText.endsWith('\n') ? fixed : fixed.slice(0, -1), // remove redundant new line
                )
              },
            }),
        )
      },
    }
  },
}
