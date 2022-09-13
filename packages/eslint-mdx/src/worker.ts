/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable unicorn/no-await-expression-member */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Token, TokenType, tokTypes as _tokTypes } from 'acorn'
import { cosmiconfig } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import type { AST } from 'eslint'
import type { EsprimaToken } from 'espree/lib/token-translator'
import type {
  BaseExpression,
  Comment,
  Expression,
  ExpressionStatement,
  ObjectExpression,
  Program,
  SpreadElement,
  TemplateElement,
} from 'estree'
import type { JSXClosingElement, JSXElement, JSXFragment } from 'estree-jsx'
import type { BlockContent, PhrasingContent } from 'mdast'
import type { Options } from 'micromark-extension-mdx-expression'
import type { Root } from 'remark-mdx'
import { extractProperties, runAsWorker } from 'synckit'
import type { FrozenProcessor, Plugin } from 'unified'
import type { Node } from 'unist'
import { ok as assert } from 'uvu/assert'
import type { VFileMessage } from 'vfile-message'

import {
  arrayify,
  loadEsmModule,
  nextCharOffsetFactory,
  normalizePosition,
  prevCharOffsetFactory,
  requirePkg,
} from './helpers'
import { restoreTokens } from './tokens'
import type {
  NormalPosition,
  RemarkConfig,
  RemarkPlugin,
  WorkerOptions,
  WorkerResult,
} from './types'

let acorn: typeof import('acorn')
let acornJsx: {
  default: typeof import('acorn-jsx')
}
let acornParser: typeof import('acorn').Parser

let tokTypes: typeof _tokTypes
let jsxTokTypes: Record<string, TokenType>
let tt: Record<string, TokenType> & typeof _tokTypes

let TokenTranslator: typeof import('espree/lib/token-translator')['default']

const explorer = cosmiconfig('remark', {
  packageProp: 'remarkConfig',
})

export const processorCache = new Map<string, FrozenProcessor>()

const getRemarkMdxOptions = (tokens: Token[]): Options => ({
  acorn: acornParser,
  acornOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
    ranges: true,
    onToken: tokens,
  },
})

const sharedTokens: Token[] = []

export const getRemarkProcessor = async (
  searchFrom: string,
  isMdx: boolean,
  ignoreRemarkConfig?: boolean,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const initCacheKey = `${String(isMdx)}-${searchFrom}`

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result: CosmiconfigResult = ignoreRemarkConfig
    ? null
    : await explorer.search(searchFrom)

  const cacheKey = result
    ? `${String(isMdx)}-${result.filepath}`
    : String(isMdx)

  cachedProcessor = processorCache.get(cacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const { unified } = await loadEsmModule<typeof import('unified')>('unified')
  const remarkParse = (
    await loadEsmModule<typeof import('remark-parse')>('remark-parse')
  ).default
  const remarkStringify = (
    await loadEsmModule<typeof import('remark-stringify')>('remark-stringify')
  ).default
  const remarkMdx = (
    await loadEsmModule<typeof import('remark-mdx')>('remark-mdx')
  ).default

  const remarkProcessor = unified().use(remarkParse).freeze()

  if (result) {
    /* istanbul ignore next */
    const { plugins = [], settings } =
      // type-coverage:ignore-next-line -- cosmiconfig's typings issue
      (result.config || {}) as Partial<RemarkConfig>

    // disable this rule automatically since we already have a parser option `extensions`
    // only disable this plugin if there are at least one plugin enabled
    // otherwise it is redundant
    /* istanbul ignore else */
    if (plugins.length > 0) {
      try {
        plugins.push([await requirePkg('lint-file-extension', 'remark'), false])
      } catch {
        // just ignore if the package does not exist
      }
    }

    const initProcessor = remarkProcessor()
      .use({ settings })
      .use(remarkStringify)

    if (isMdx) {
      initProcessor.use(remarkMdx, getRemarkMdxOptions(sharedTokens))
    }

    cachedProcessor = (
      await plugins.reduce(async (processor, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = arrayify(pluginWithSettings) as [
          RemarkPlugin,
          ...unknown[],
        ]
        return (await processor).use(
          /* istanbul ignore next */
          typeof plugin === 'string'
            ? await requirePkg<Plugin>(plugin, 'remark', result.filepath)
            : plugin,
          ...pluginSettings,
        )
      }, Promise.resolve(initProcessor))
    ).freeze()
  } else {
    const initProcessor = remarkProcessor().use(remarkStringify)

    if (isMdx) {
      initProcessor.use(remarkMdx, getRemarkMdxOptions(sharedTokens))
    }

    cachedProcessor = initProcessor.freeze()
  }

  processorCache
    .set(initCacheKey, cachedProcessor)
    .set(cacheKey, cachedProcessor)

  return cachedProcessor
}

runAsWorker(
  async ({
    fileOptions,
    physicalFilename,
    isMdx,
    process,
    ignoreRemarkConfig,
  }: // eslint-disable-next-line sonarjs/cognitive-complexity
  WorkerOptions): Promise<WorkerResult> => {
    sharedTokens.length = 0

    /**
     * unified plugins are using ESM version of acorn,
     * so we have to use the same version as well,
     * otherwise the TokenType will be different class
     * @see also https://github.com/acornjs/acorn-jsx/issues/133
     */
    if (!acorn) {
      acorn = await loadEsmModule<typeof import('acorn')>('acorn')
      acornJsx = await loadEsmModule<{ default: typeof import('acorn-jsx') }>(
        'acorn-jsx',
      )
      acornParser = acorn.Parser.extend(acornJsx.default())
    }

    const processor = await getRemarkProcessor(
      physicalFilename,
      isMdx,
      ignoreRemarkConfig,
    )

    if (process) {
      const { VFile } = await loadEsmModule<typeof import('vfile')>('vfile')
      const file = new VFile(fileOptions)
      try {
        await processor.process(file)
      } catch (err) {
        const error = err as VFileMessage
        if (!file.messages.includes(error)) {
          file.message(error).fatal = true
        }
      }

      return {
        messages: file.messages.map(message => extractProperties(message)),
        content: file.toString(),
      }
    }

    if (!tokTypes) {
      tokTypes = acorn.tokTypes
    }

    if (!jsxTokTypes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      jsxTokTypes = acornJsx.default(
        {
          allowNamespacedObjects: true,
        },
        // @ts-expect-error
      )(acorn.Parser).acornJsx.tokTypes
    }

    if (!TokenTranslator) {
      TokenTranslator = (
        await loadEsmModule<typeof import('espree/lib/token-translator')>(
          pathToFileURL(
            path.resolve(
              require.resolve('espree/package.json'),
              '../lib/token-translator.js',
            ),
          ),
        )
      ).default
    }

    if (!tt) {
      tt = {
        ...tokTypes,
        ...jsxTokTypes,
      }
    }

    const text = fileOptions.value as string
    const tokenTranslator = new TokenTranslator(tt, text)

    const root = processor.parse(fileOptions) as Root

    const body: Program['body'] = []
    const comments: Comment[] = []
    const tokens: AST.Token[] = []

    const { visit } = await loadEsmModule<typeof import('unist-util-visit')>(
      'unist-util-visit',
    )

    const processed = new WeakSet<Node>()

    // TODO: merge with `tokens.ts`
    if (isMdx) {
      const prevCharOffset = prevCharOffsetFactory(text)
      const nextCharOffset = nextCharOffsetFactory(text)

      const normalizeNode = (start: number, end: number) => ({
        ...normalizePosition({
          start: { offset: start },
          end: { offset: end },
          text,
        }),
        raw: text.slice(start, end),
      })

      visit(root, node => {
        if (
          processed.has(node) ||
          (node.type !== 'mdxFlowExpression' &&
            node.type !== 'mdxJsxFlowElement' &&
            node.type !== 'mdxJsxTextElement' &&
            node.type !== 'mdxTextExpression' &&
            node.type !== 'mdxjsEsm')
        ) {
          return
        }

        processed.add(node)

        function handleChildren(node: BlockContent | PhrasingContent) {
          return 'children' in node
            ? (node.children as Array<BlockContent | PhrasingContent>).reduce<
                JSXElement['children']
              >((acc, child) => {
                processed.add(child)

                if (child.data && 'estree' in child.data && child.data.estree) {
                  const estree = child.data.estree as Program

                  assert(estree.body.length <= 1)

                  const expStat = estree.body[0] as ExpressionStatement

                  if (expStat) {
                    const expression =
                      expStat.expression as BaseExpression as JSXElement['children'][number]
                    acc.push(expression)
                  }

                  comments.push(...estree.comments)
                } else {
                  const expression = handleNode(
                    child,
                  ) as JSXElement['children'][number]
                  if (expression) {
                    acc.push(expression)
                  }
                }

                return acc
              }, [])
            : []
        }

        function handleNode(node: BlockContent | PhrasingContent) {
          if (
            node.type !== 'mdxJsxTextElement' &&
            node.type !== 'mdxJsxFlowElement'
          ) {
            return
          }

          const children = handleChildren(node)

          const nodePos = node.position

          const nodeStart = nodePos.start.offset
          const nodeEnd = nodePos.end.offset

          const lastCharOffset = prevCharOffset(nodeEnd - 2)

          let expression: BaseExpression

          if (node.name) {
            const nodeNameLength = node.name.length
            const nodeNameStart = nextCharOffset(nodeStart + 1)

            const selfClosing = text[lastCharOffset] === '/'

            let lastAttrOffset = nodeNameStart + nodeNameLength - 1

            let closingElement: JSXClosingElement | null = null

            if (!selfClosing) {
              const prevOffset = prevCharOffset(lastCharOffset)
              const slashOffset = prevCharOffset(prevOffset - nodeNameLength)
              assert(text[slashOffset] === '/')
              const tagStartOffset = prevCharOffset(slashOffset - 1)
              assert(text[tagStartOffset] === '<')
              closingElement = {
                ...normalizeNode(tagStartOffset, nodeEnd),
                type: 'JSXClosingElement',
                name: {
                  ...normalizeNode(
                    prevOffset + 1 - nodeNameLength,
                    prevOffset + 1,
                  ),
                  type: 'JSXIdentifier',
                  name: node.name,
                },
              }
            }

            const jsxEl: JSXElement = {
              ...normalizeNode(nodeStart, nodeEnd),
              type: 'JSXElement',
              openingElement: {
                type: 'JSXOpeningElement',
                name: {
                  ...normalizeNode(
                    nodeNameStart,
                    nodeNameStart + nodeNameLength,
                  ),
                  type: 'JSXIdentifier',
                  name: node.name,
                },
                attributes: node.attributes.map(attr => {
                  if (attr.type === 'mdxJsxExpressionAttribute') {
                    assert(attr.data)
                    assert(attr.data.estree)
                    assert(attr.data.estree.range)

                    let [attrValStart, attrValEnd] = attr.data.estree.range

                    attrValStart = prevCharOffset(attrValStart - 1)
                    attrValEnd = nextCharOffset(attrValEnd)

                    assert(text[attrValStart] === '{')
                    assert(text[attrValEnd] === '}')

                    lastAttrOffset = attrValEnd

                    return {
                      // mdxJsxExpressionAttribute
                      ...normalizeNode(attrValStart, attrValEnd + 1),
                      type: 'JSXSpreadAttribute',
                      // https://github.com/mdx-js/eslint-mdx/pull/394#discussion_r872974843
                      argument: (
                        (
                          (attr.data.estree.body[0] as ExpressionStatement)
                            .expression as ObjectExpression
                        ).properties[0] as SpreadElement
                      ).argument,
                    }
                  }

                  const attrStart = nextCharOffset(lastAttrOffset + 1)

                  assert(attrStart != null)

                  const attrName = attr.name
                  const attrNameLength = attrName.length

                  const attrValue = attr.value

                  lastAttrOffset = attrStart + attrNameLength

                  const attrNamePos = normalizeNode(attrStart, lastAttrOffset)

                  if (attrValue == null) {
                    return {
                      ...normalizeNode(attrStart, lastAttrOffset + 1),
                      type: 'JSXAttribute',
                      name: {
                        ...attrNamePos,
                        type: 'JSXIdentifier',
                        name: attrName,
                      },
                      value: null,
                    }
                  }

                  const attrEqualOffset = nextCharOffset(
                    attrStart + attrNameLength,
                  )

                  assert(text[attrEqualOffset] === '=')

                  let attrValuePos: NormalPosition

                  if (typeof attrValue === 'string') {
                    const attrQuoteOffset = nextCharOffset(attrEqualOffset + 1)

                    const attrQuote = text[attrQuoteOffset]

                    assert(attrQuote === '"' || attrQuote === "'")

                    lastAttrOffset = nextCharOffset(
                      attrQuoteOffset + attrValue.length + 1,
                    )

                    assert(text[lastAttrOffset] === attrQuote)

                    attrValuePos = normalizeNode(
                      attrQuoteOffset,
                      lastAttrOffset + 1,
                    )
                  } else {
                    const data = attrValue.data

                    let [attrValStart, attrValEnd] = data.estree.range

                    attrValStart = prevCharOffset(attrValStart - 1)
                    attrValEnd = nextCharOffset(attrValEnd)

                    assert(text[attrValStart] === '{')
                    assert(text[attrValEnd] === '}')

                    lastAttrOffset = attrValEnd

                    attrValuePos = normalizeNode(attrValStart, attrValEnd + 1)
                  }

                  return {
                    ...attrNamePos,
                    type: 'JSXAttribute',
                    name: {
                      ...attrNamePos,
                      type: 'JSXIdentifier',
                      name: attrName,
                    },
                    value:
                      typeof attr.value === 'string'
                        ? {
                            ...attrValuePos,
                            type: 'Literal',
                            value: attr.value,
                          }
                        : {
                            ...attrValuePos,
                            type: 'JSXExpressionContainer',
                            expression: (
                              attr.value.data.estree
                                .body[0] as ExpressionStatement
                            ).expression,
                          },
                  }
                }),
                selfClosing,
              },
              closingElement,
              children,
            }

            let nextOffset = nextCharOffset(lastAttrOffset + 1)
            let nextChar = text[nextOffset]

            if (!selfClosing && nextChar !== '>') {
              nextOffset = /** @type {number} */ nextCharOffset(lastAttrOffset)
              nextChar = text[nextOffset]
            }

            const expectedNextChar = selfClosing ? '/' : '>'

            assert(
              nextChar === expectedNextChar,
              `\`nextChar\` must be '${expectedNextChar}' but actually is '${nextChar}'`,
            )

            Object.assign(
              jsxEl.openingElement,
              normalizeNode(nodeStart, selfClosing ? nodeEnd : nextOffset + 1),
            )

            expression = jsxEl
          } else {
            const openEndOffset = nextCharOffset(nodeStart + 1)

            const openPos = normalizeNode(nodeStart, openEndOffset)

            const closeStartOffset = prevCharOffset(lastCharOffset - 1)

            const jsxFrg: JSXFragment = {
              ...openPos,
              type: 'JSXFragment',
              openingFragment: {
                ...openPos,
                type: 'JSXOpeningFragment',
              },
              closingFragment: {
                ...normalizeNode(closeStartOffset, nodeEnd),
                type: 'JSXClosingFragment',
              },
              children,
            }

            expression = jsxFrg
          }

          return expression
        }

        const expression = handleNode(node) as Expression

        if (expression) {
          body.push({
            ...normalizePosition(node.position),
            type: 'ExpressionStatement',
            expression: handleNode(node) as Expression,
          })
        }

        const estree = (node.data?.estree || {
          body: [],
          comments: [],
        }) as Program

        body.push(...estree.body)
        comments.push(...estree.comments)
      })
    }

    const { visit: visitEstree } = await loadEsmModule<
      typeof import('estree-util-visit')
    >('estree-util-visit')

    visitEstree(
      {
        type: 'Program',
        sourceType: 'module',
        body,
      },
      node => {
        if (node.type !== 'TemplateElement') {
          return
        }

        /**
         * Copied from @see https://github.com/eslint/espree/blob/main/lib/espree.js#L206-L220
         */
        const templateElement = node as TemplateElement

        const startOffset = -1
        const endOffset = templateElement.tail ? 1 : 2

        // @ts-expect-error - unavailable for typing from estree
        templateElement.start += startOffset
        // @ts-expect-error - unavailable for typing from estree
        templateElement.end += endOffset

        if (templateElement.range) {
          templateElement.range[0] += startOffset
          templateElement.range[1] += endOffset
        }

        if (templateElement.loc) {
          templateElement.loc.start.column += startOffset
          templateElement.loc.end.column += endOffset
        }
      },
    )

    for (const token of restoreTokens(text, root, sharedTokens, tt, visit)) {
      tokenTranslator.onToken(token, {
        ecmaVersion: 'latest',
        tokens: tokens as EsprimaToken[],
      })
    }

    return {
      root,
      body,
      comments,
      tokens,
    }
  },
)
