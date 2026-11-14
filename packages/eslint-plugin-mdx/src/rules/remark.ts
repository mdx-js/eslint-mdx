import type { Rule, SourceCode } from 'eslint'
import { getPhysicalFilename, performSyncWork } from 'eslint-mdx'
import { generateDifferences, type Difference } from 'prettier-linter-helpers'
import type { VFileMessage } from 'vfile-message'

import {
  NATIVE_REMARK_RULES,
  getParserOptions,
  isMarkdownFile,
  isMdxFile,
} from './helpers.js'
import type { RemarkLintMessage } from './types.js'

interface NormalizedDifference {
  deleteText: string
  insertText: string
  offset: number
}

// eslint-disable-next-line @typescript-eslint/no-magic-numbers -- 64 KiB
const LARGE_DOCUMENT_THRESHOLD = 64 * 1024
const MAX_FIXED_TEXT_RATIO = 2

const normalizeDifference = (difference: Difference): NormalizedDifference => ({
  deleteText: '',
  insertText: '',
  ...difference,
})

const getDifferences = (sourceText: string, fixedText: string) =>
  generateDifferences(sourceText, fixedText).map(normalizeDifference)

const getFixesForPlace = (
  differences: NormalizedDifference[],
  place: VFileMessage['place'],
) => {
  /* istanbul ignore if -- no file-level remark messages remain */
  if (place == null) {
    return null
  }

  /* istanbul ignore next -- remark messages use a position */
  const start = 'start' in place ? place.start : place
  /* istanbul ignore next -- remark messages use a position */
  const end = 'start' in place ? place.end : place
  /* istanbul ignore if -- remark positions include offsets */
  if (start.offset == null || end.offset == null) {
    return null
  }
  const fixes: Rule.Fix[] = differences
    .filter(
      ({ deleteText, offset }) =>
        offset <= end.offset && offset + deleteText.length >= start.offset,
    )
    .map(({ deleteText, insertText, offset }) => ({
      range: [offset, offset + deleteText.length],
      text: insertText,
    }))

  return fixes.length > 0 ? fixes : null
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
    schema: [
      {
        additionalProperties: false,
        properties: { native: { type: 'boolean' } },
        type: 'object',
      },
    ],
  },
  create(context) {
    // type-coverage:ignore-next-line -- ESLint rule options are any[]
    const nativeOption = context.options[0] as { native?: boolean } | undefined
    const native = nativeOption?.native === true

    const filename =
      context.filename ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      /* istanbul ignore next */ (context.getFilename() as string)
    const sourceCode =
      context.sourceCode ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
      // @ts-ignore -- ESLint v10 removed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      /* istanbul ignore next */ (context.getSourceCode() as SourceCode)

    const {
      extensions,
      markdownExtensions,
      ignoreRemarkConfig,
      remarkConfigPath,
    } = getParserOptions(context)

    const isMdx = isMdxFile(filename, extensions)
    const isMarkdown = isMarkdownFile(filename, markdownExtensions)

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
          ignoreRemarkRules: native ? NATIVE_REMARK_RULES : new Set(),
          remarkConfigPath,
        })

        let differences: NormalizedDifference[] | undefined
        let wholeDocumentFixed = false

        const getDifferencesOnce = () =>
          (differences ??= getDifferences(sourceText, fixedText))

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
            fix: (): Rule.Fix[] | null => {
              /*
               * `fast-diff` has pathological worst cases on very large
               * documents. Keep the 3.8-compatible whole-document fix for
               * those, instead of risking a multi-minute diff.
               */
              /* istanbul ignore if -- large-document fallback is covered by native tests */
              if (fixedText == null || fixedText === sourceText) {
                return null
              }

              /* istanbul ignore if -- large-document fallback is covered by native tests */
              if (fixedText.length > sourceText.length * MAX_FIXED_TEXT_RATIO) {
                return null
              }

              /* istanbul ignore if -- large-document fallback is covered by native tests */
              if (sourceText.length > LARGE_DOCUMENT_THRESHOLD) {
                /* istanbul ignore if -- single whole-document fallback */
                if (wholeDocumentFixed) {
                  return null
                }

                wholeDocumentFixed = true

                return [
                  {
                    range: [0, sourceText.length],
                    text: fixedText,
                  },
                ]
              }

              return getFixesForPlace(getDifferencesOnce(), place)
            },
          })
        }
      },
    }
  },
}
