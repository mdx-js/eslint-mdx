import path from 'path'

import type { AST, Linter } from 'eslint'

import {
  isMdxNode,
  normalizeParser,
  normalizePosition,
  performSyncWork,
} from './helpers'
import { getPhysicalFilename } from './processor'
import { traverse } from './traverse'
import type { ParserFn, ParserOptions } from './types'

export const AST_PROPS = ['body', 'comments'] as const

export const LOC_ERROR_PROPERTIES = ['column', 'lineNumber'] as const

export const DEFAULT_EXTENSIONS: readonly string[] = ['.mdx']
export const MARKDOWN_EXTENSIONS: readonly string[] = ['.md']

export const PLACEHOLDER_FILE_PATH = '__placeholder__.mdx'

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  comment: true,
  ecmaFeatures: {
    jsx: true,
  },
  ecmaVersion: 'latest',
  sourceType: 'module',
  tokens: true,
  filePath: PLACEHOLDER_FILE_PATH,
  // required for @typescript-eslint/parser
  // reference: https://github.com/typescript-eslint/typescript-eslint/pull/2028
  loc: true,
  range: true,
}

export class Parser {
  // @internal
  private _ast: AST.Program

  constructor() {
    this.parse = this.parse.bind(this)
    this.parseForESLint = this.parseForESLint.bind(this)
  }

  parse(code: string, options?: ParserOptions) {
    return this.parseForESLint(code, options).ast
  }

  parseForESLint(
    code: string,
    options?: ParserOptions,
  ): Linter.ESLintParseResult {
    options = { ...DEFAULT_PARSER_OPTIONS, ...options }

    const extname = path.extname(options.filePath)
    const isMdx = [
      ...DEFAULT_EXTENSIONS,
      ...(options.extensions || []),
    ].includes(extname)
    const isMarkdown = [
      ...MARKDOWN_EXTENSIONS,
      ...(options.markdownExtensions || []),
    ].includes(extname)
    if (!isMdx && !isMarkdown) {
      return this._eslintParse(code, options)
    }

    const physicalFilename = getPhysicalFilename(options.filePath)

    const { root, tokens, comments } = performSyncWork({
      fileOptions: {
        path: physicalFilename,
        value: code,
      },
      physicalFilename,
      isMdx,
      ignoreRemarkConfig: options.ignoreRemarkConfig,
    })

    this._ast = {
      ...normalizePosition(root.position),
      type: 'Program',
      sourceType: options.sourceType,
      body: [],
      comments,
      tokens,
    }

    if (isMdx) {
      traverse(root, node => {
        if (!isMdxNode(node)) {
          return
        }

        for (const prop of AST_PROPS) {
          // @ts-expect-error
          this._ast[prop].push(...(node.data?.estree[prop] || []))
        }
      })
    }

    return { ast: this._ast }
  }

  // @internal
  private _eslintParse(code: string, options: ParserOptions) {
    const parsers = normalizeParser(options.parser)

    let program: ReturnType<ParserFn>
    let parseError: Error
    for (const parser of parsers) {
      try {
        program = parser(code, options)
        break
      } catch (err) {
        if (!parseError) {
          parseError = err as Error
        }
      }
    }

    if (!program && parseError) {
      throw parseError
    }

    /* istanbul ignore next */
    return (
      'ast' in program && program.ast ? program : { ast: program }
    ) as Linter.ESLintParseResult
  }
}

export const parser = new Parser()

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { parse, parseForESLint } = parser
