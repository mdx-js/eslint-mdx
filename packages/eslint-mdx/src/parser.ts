import path from 'node:path'

import type { AST, Linter } from 'eslint'
import { analyze } from 'eslint-scope'
import { KEYS } from 'eslint-visitor-keys'
import type { VFileMessage } from 'vfile-message'

import { arrayify, normalizePosition, getPhysicalFilename } from './helpers.js'
import { performSyncWork } from './sync.js'
import type { ParserOptions, WorkerParseResult } from './types.js'

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
      sourceType = 'module',
      ignoreRemarkConfig,
      remarkConfigPath,
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

    let result: WorkerParseResult

    try {
      result = performSyncWork({
        filePath: getPhysicalFilename(filePath),
        code,
        isMdx,
        ignoreRemarkConfig,
        remarkConfigPath,
      })
    } catch (err: unknown) {
      /* istanbul ignore if */
      if (process.argv.includes('--debug')) {
        console.error(err)
      }
      const { message, line, column, place } = err as VFileMessage
      const point = place && ('start' in place ? place.start : place)
      throw Object.assign(
        new SyntaxError(message, {
          cause: err,
        }),
        {
          lineNumber: line,
          column,
          index: /* istanbul ignore next */ point?.offset,
        },
      )
    }

    const { root, body, comments, tokens } = result

    const visitorKeys: Record<string, string[]> = {
      ...KEYS,
      MDBlockquote: ['children'],
      MDBreak: [],
      MDCode: [],
      MDDefinition: [],
      MDDelete: ['children'],
      MDEmphasis: ['children'],
      MDFootnoteDefinition: ['children'],
      MDFootnoteReference: [],
      MDHeading: ['children'],
      MDImage: [],
      MDImageReference: [],
      MDInlineCode: [],
      MDInlineMath: [],
      MDLink: ['children'],
      MDLinkReference: ['children'],
      MDList: ['children'],
      MDListItem: ['children'],
      MDMath: [],
      MDParagraph: ['children'],
      MDStrong: ['children'],
      MDTable: ['children'],
      MDTableCell: ['children'],
      MDTableRow: ['children'],
      MDText: [],
      MDThematicBreak: [],
      MDToml: [],
      MDXFlowExpression: ['expression'],
      MDXTextExpression: ['expression'],
      MDYaml: [],
    }

    const ast: AST.Program = {
      ...normalizePosition(root.position),
      type: 'Program',
      // @ts-expect-error -- should we change?
      sourceType,
      body,
      comments,
      tokens,
    }

    const scopeManager = analyze(ast, {
      childVisitorKeys: visitorKeys,
      ecmaVersion: 2024,
      ignoreEval: true,
      jsx: true,
      sourceType,
    })

    const { globalScope } = scopeManager

    const esmRanges = body
      .filter(
        node =>
          node.type === 'ImportDeclaration' ||
          node.type === 'ExportAllDeclaration' ||
          node.type === 'ExportDefaultDeclaration' ||
          node.type === 'ExportNamedDeclaration',
      )
      .map(node => node.range)
      .filter(Boolean)

    globalScope.through = globalScope.through.filter(
      reference =>
        reference.identifier.name !== 'props' ||
        esmRanges.some(
          range =>
            reference.identifier.range[0] >= range[0] &&
            reference.identifier.range[1] <= range[1],
        ),
    )

    return {
      ast,
      scopeManager,
      visitorKeys,
    }
  }
}

export const parser = new Parser()

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { parse, parseForESLint } = parser
