import path from 'node:path'

import type { Rule, SourceCode } from 'eslint'
import type { ParserOptions } from 'eslint-mdx'
import {
  DEFAULT_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  getPhysicalFilename,
  performSyncWork,
} from 'eslint-mdx'
import { generateDifferences } from 'prettier-linter-helpers'

import type { RemarkLintMessage } from './types.js'

const isFixWithinMessage = (
  sourceText: string,
  fixedText: string | null | undefined,
  place: unknown,
) => {
  if (
    fixedText == null ||
    fixedText === sourceText ||
    place == null ||
    typeof place !== 'object' ||
    !('start' in place)
  ) {
    return false
  }

  const { start, end } = place as {
    start: { offset: number }
    end: { offset: number }
  }
  return generateDifferences(sourceText, fixedText).every(difference => {
    const diffEnd =
      difference.offset +
      ('deleteText' in difference ? difference.deleteText.length : 0)
    return difference.offset <= end.offset && diffEnd >= start.offset
  })
}

export const remark: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Linter integration with remark plugins',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      category: 'Stylistic Issues',
      recommended: true,
    },
    fixable: 'code',
  },
  create(context) {
    const filename =
      context.filename ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      /* istanbul ignore next */ (context.getFilename() as string)
    const extname = path.extname(filename)
    const sourceCode =
      context.sourceCode ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      /* istanbul ignore next */ (context.getSourceCode() as SourceCode)

    /* istanbul ignore next */
    const {
      extensions,
      markdownExtensions,
      ignoreRemarkConfig,
      remarkConfigPath,
    } = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      ...context.parserOptions,
      ...context.languageOptions?.parserOptions,
    } as ParserOptions

    const isMdx = [...DEFAULT_EXTENSIONS, ...(extensions || [])].includes(
      extname,
    )
    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...(markdownExtensions || []),
    ].includes(extname)

    return {
      Program(node) {
        /* istanbul ignore if */
        if (!isMdx && !isMarkdown) {
          return
        }

        const sourceText = sourceCode.getText(node)

        const { messages, content: fixedText } = performSyncWork({
          filePath: getPhysicalFilename(filename),
          code: sourceText,
          cwd:
            context.cwd ??
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore -- ESLint v10 removed
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ESLint v10 removed
            /* istanbul ignore next */ (context.getCwd() as string),
          isMdx,
          process: true,
          ignoreRemarkConfig,
          remarkConfigPath,
        })

        let fixed = 0

        for (const {
          source,
          reason,
          ruleId,
          fatal,
          line,
          column,
          place,
        } of messages) {
          // https://github.com/remarkjs/remark-lint/issues/65#issuecomment-220800231
          /* istanbul ignore next */
          // eslint-disable-next-line sonarjs/no-nested-conditional
          const severity = fatal ? 2 : fatal == null ? 0 : 1
          /* istanbul ignore if */
          if (!severity) {
            // should never happen, just for robustness
            continue
          }

          const message: RemarkLintMessage = {
            reason,
            source,
            ruleId,
            severity,
          }

          const point = {
            line,
            // ! eslint ast column is 0-indexed, but unified is 1-indexed
            column: column - 1,
          }

          const shouldFix = isFixWithinMessage(sourceText, fixedText, place)

          context.report({
            // related to https://github.com/eslint/eslint/issues/14198
            message: JSON.stringify(message),
            loc:
              /* istanbul ignore next */ place && 'start' in place
                ? {
                    ...point,
                    start: { ...place.start, column: place.start.column - 1 },
                    end: { ...place.end, column: place.end.column - 1 },
                  }
                : point,
            node,
            fix: shouldFix
              ? () =>
                  fixed++
                    ? null
                    : {
                        range: [0, sourceText.length],
                        text: fixedText,
                      }
              : null,
          })
        }
      },
    }
  },
}
