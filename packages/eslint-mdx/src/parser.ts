import path from 'node:path'

import type { Linter } from 'eslint'
import type { VFileMessage } from 'vfile-message'

import { arrayify, normalizePosition, getPhysicalFilename } from './helpers'
import { performSyncWork } from './sync'
import type { ParserOptions, WorkerParseResult } from './types'

export const DEFAULT_EXTENSIONS: readonly string[] = ['.mdx']
export const MARKDOWN_EXTENSIONS: readonly string[] = ['.md']

export class Parser {
  constructor() {
    this.parse = this.parse.bind(this)
    this.parseForESLint = this.parseForESLint.bind(this)
  }

  parse(code: string, options: ParserOptions) {
    return this.parseForESLint(code, options).ast
  }

  parseForESLint(
    code: string,
    {
      filePath,
      sourceType,
      ignoreRemarkConfig,
      extensions,
      markdownExtensions,
    }: ParserOptions,
  ): Linter.ESLintParseResult {
    const extname = path.extname(filePath)

    const isMdx = [...DEFAULT_EXTENSIONS, ...arrayify(extensions)].includes(
      extname,
    )

    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...arrayify(markdownExtensions),
    ].includes(extname)

    if (!isMdx && !isMarkdown) {
      throw new Error(
        'Unsupported file extension, make sure setting the `extensions` or `markdownExtensions` option correctly.',
      )
    }

    const physicalFilename = getPhysicalFilename(filePath)

    let result: WorkerParseResult

    try {
      result = performSyncWork({
        fileOptions: {
          path: physicalFilename,
          value: code,
        },
        physicalFilename,
        isMdx,
        ignoreRemarkConfig,
      })
    } catch (err: unknown) {
      const error = err as VFileMessage
      throw Object.assign(
        new SyntaxError(`message: ${error.message}\nstack: ${error.stack}`, {
          cause: error,
        }),
        {
          lineNumber: error.line,
          column: error.column,
          index: /* istanbul ignore next */ error.position?.start.offset,
        },
      )
    }

    const { root, body, comments, tokens } = result

    return {
      ast: {
        ...normalizePosition(root.position),
        type: 'Program',
        sourceType,
        body,
        comments,
        tokens,
      },
    }
  }
}

export const parser = new Parser()

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { parse, parseForESLint } = parser
