import path from 'node:path'

import type { AST, Linter } from 'eslint'
import { analyze, Scope, Variable } from 'eslint-scope'
import { KEYS } from 'eslint-visitor-keys'
import { latestEcmaVersion } from 'espree'
import type { Node } from 'estree'
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
      ecmaVersion,
      ignoreRemarkConfig,
      remarkConfigPath,
      extensions,
      markdownExtensions,
    }: ParserOptions,
  ): Linter.ESLintParseResult {
    const extname = path.extname(filePath!)

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
        filePath: getPhysicalFilename(filePath!),
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
      ...normalizePosition(root.position!),
      type: 'Program',
      // @ts-expect-error -- should we change?
      sourceType,
      body,
      comments: comments!,
      tokens,
    }

    const scopeManager = analyze(ast, {
      childVisitorKeys: visitorKeys,
      ecmaVersion:
        typeof ecmaVersion === 'number' ? ecmaVersion : latestEcmaVersion,
      ignoreEval: true,
      jsx: true,
      sourceType,
    })

    const globalScope = scopeManager.globalScope!

    const esmRanges = root.children
      .filter(node => node.type === 'mdxjsEsm' && node.position)
      .map(
        node =>
          [node.position!.start.offset!, node.position!.end.offset!] as const,
      )

    const isEsmRange = (range: [number, number]) =>
      esmRanges.some(([start, end]) => range[0] >= start && range[1] <= end)

    globalScope.through = globalScope.through.filter(
      reference =>
        reference.identifier.name !== 'props' ||
        isEsmRange(reference.identifier.range!),
    )

    // react/jsx-no-undef reads scope variables instead of through.
    // Give JSX content a small block scope containing props, but preserve
    // the real innermost scope so local components remain visible.
    const acquireScope = scopeManager.acquire.bind(scopeManager)

    const getOriginalScope = (node: Node) => {
      let current: Node | undefined = node
      let scope: Scope | null | undefined = acquireScope(current, true)

      while (current && !scope) {
        current = (current as { parent?: Node }).parent
        scope = current ? acquireScope(current, true) : undefined
      }

      return scope || globalScope
    }

    scopeManager.acquire = (node, inner) => {
      if (
        node.type !== 'JSXIdentifier' ||
        !node.range ||
        isEsmRange(node.range)
      ) {
        return acquireScope(node, inner)
      }

      const propsScope = new Scope(
        scopeManager,
        'block',
        getOriginalScope(node),
        ast,
        false,
      )
      propsScope.variables.push(new Variable('props', propsScope))
      return propsScope
    }

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
