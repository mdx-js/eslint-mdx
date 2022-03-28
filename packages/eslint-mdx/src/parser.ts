import path from 'path'

import type { AST, Linter } from 'eslint'

import {
  arrayify,
  isMdxNode,
  normalizePosition,
  performSyncWork,
} from './helpers'
import { getPhysicalFilename } from './processor'
import { traverse } from './traverse'
import type { ParserOptions } from './types'

export const AST_PROPS = ['body', 'comments'] as const

export const DEFAULT_EXTENSIONS: readonly string[] = ['.mdx']
export const MARKDOWN_EXTENSIONS: readonly string[] = ['.md']

export class Parser {
  // @internal
  private _ast: AST.Program

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

    const { root, tokens, comments } = performSyncWork({
      fileOptions: {
        path: physicalFilename,
        value: code,
      },
      physicalFilename,
      isMdx,
      ignoreRemarkConfig: ignoreRemarkConfig,
    })

    this._ast = {
      ...normalizePosition(root.position),
      type: 'Program',
      sourceType,
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
}

export const parser = new Parser()

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { parse, parseForESLint } = parser
