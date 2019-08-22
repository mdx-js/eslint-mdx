import path from 'path'

import { DEFAULT_EXTENSIONS, MARKDOWN_EXTENSIONS } from 'eslint-mdx'
import vfile from 'vfile'

import { getRemarkProcessor } from './helper'

import { Rule } from 'eslint'

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
      MARKDOWN_EXTENSIONS,
      context.parserOptions.markdownExtensions || [],
    )
    return {
      Program(node) {
        /* istanbul ignore if */
        if (!extensions.includes(extname)) {
          return
        }
        const sourceText = sourceCode.getText(node)
        const remarkProcessor = getRemarkProcessor(filename)
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
