/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable unicorn/no-await-expression-member */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Token, TokenType, tokTypes as _tokTypes } from 'acorn'
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
} from 'estree'
import type {
  JSXClosingElement,
  JSXElement,
  JSXFragment,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXText,
} from 'estree-jsx'
import type { BlockContent, Paragraph, PhrasingContent, Literal } from 'mdast'
import type { Options } from 'micromark-extension-mdx-expression'
import type { Root } from 'remark-mdx'
import { extractProperties, runAsWorker } from 'synckit'
import type { FrozenProcessor } from 'unified'
import type { Config, Configuration } from 'unified-engine/lib/configuration'
import type { Node } from 'unist'
import { ok as assert } from 'uvu/assert'
import type { VFileMessage } from 'vfile-message'

import {
  loadEsmModule,
  nextCharOffsetFactory,
  normalizePosition,
  prevCharOffsetFactory,
} from './helpers'
import { restoreTokens } from './tokens'
import type {
  Arrayable,
  NormalPosition,
  WorkerOptions,
  WorkerResult,
} from './types'

let config: Configuration

let acorn: typeof import('acorn')
let acornJsx: {
  default: typeof import('acorn-jsx')
}
let acornParser: typeof import('acorn').Parser

let tokTypes: typeof _tokTypes
let jsxTokTypes: Record<string, TokenType>
let tt: Record<string, TokenType> & typeof _tokTypes

let TokenTranslator: typeof import('espree/lib/token-translator')['default']

export const processorCache = new Map<string, FrozenProcessor>()

const getRemarkConfig = async (searchFrom: string) => {
  if (!config) {
    const { Configuration } = await loadEsmModule<
      typeof import('unified-engine/lib/configuration')
    >('unified-engine/lib/configuration.js')
    config = new Configuration({
      cwd: process.cwd(),
      packageField: 'remarkConfig',
      pluginPrefix: 'remark',
      rcName: '.remarkrc',
      detectConfig: true,
    })
  }

  return new Promise<Config>((resolve, reject) =>
    config.load(searchFrom, (error, result) =>
      error ? reject(error) : resolve(result),
    ),
  )
}

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
) => {
  const initCacheKey = `${String(isMdx)}-${searchFrom}`

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result = ignoreRemarkConfig ? null : await getRemarkConfig(searchFrom)

  const cacheKey = result?.filePath
    ? `${String(isMdx)}-${result.filePath}`
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

  if (result?.filePath) {
    const { plugins, settings } = result

    // disable this rule automatically since we already have a parser option `extensions`
    // only disable this plugin if there are at least one plugin enabled
    // otherwise it is redundant
    /* istanbul ignore else */
    if (plugins.length > 0) {
      try {
        plugins.push([
          (
            await loadEsmModule<typeof import('remark-lint-file-extension')>(
              'remark-lint-file-extension',
            )
          ).default,
          false,
        ])
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

    cachedProcessor = plugins
      .reduce((processor, plugin) => processor.use(...plugin), initProcessor)
      .freeze()
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

      const handleJsxName = (
        nodeName: string,
        start: number,
      ): JSXIdentifier | JSXMemberExpression | JSXNamespacedName => {
        const name = nodeName.trim()
        const nameIndex = nodeName.indexOf(name)

        const colonIndex = nodeName.indexOf(':')
        if (colonIndex !== -1) {
          const [fullNamespace, fullName] = nodeName.split(':')
          return {
            ...normalizeNode(
              start + nameIndex,
              start + nameIndex + name.length,
            ),
            type: 'JSXNamespacedName',
            namespace: handleJsxName(fullNamespace, start) as JSXIdentifier,
            name: handleJsxName(
              fullName,
              start + colonIndex + 1,
            ) as JSXIdentifier,
          }
        }

        const lastPointIndex = nodeName.lastIndexOf('.')
        if (lastPointIndex === -1) {
          return {
            ...normalizeNode(
              start + nameIndex,
              start + nameIndex + name.length,
            ),
            type: 'JSXIdentifier',
            name,
          }
        }

        const objectName = nodeName.slice(0, lastPointIndex)
        const propertyName = nodeName.slice(lastPointIndex + 1)

        return {
          ...normalizeNode(start + nameIndex, start + nameIndex + name.length),
          type: 'JSXMemberExpression',
          object: handleJsxName(objectName, start) as
            | JSXIdentifier
            | JSXMemberExpression,
          property: handleJsxName(
            propertyName,
            start + lastPointIndex + 1,
          ) as JSXIdentifier,
        }
      }

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

        function handleChildren(
          node: BlockContent | Literal | Paragraph | PhrasingContent,
        ) {
          return 'children' in node
            ? (
                node.children as Array<BlockContent | Literal | PhrasingContent>
              ).reduce<JSXElement['children']>((acc, child) => {
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
                  const expression = handleNode(child) as Arrayable<
                    JSXElement['children']
                  >
                  if (Array.isArray(expression)) {
                    acc.push(...expression)
                  } else if (expression) {
                    acc.push(expression)
                  }
                }

                return acc
              }, [])
            : []
        }

        function handleNode(
          node: BlockContent | Literal | Paragraph | PhrasingContent,
        ) {
          if (node.type === 'paragraph') {
            return handleChildren(node)
          }

          if (node.type === 'text') {
            const {
              start: { offset: start },
              end: { offset: end },
            } = node.position
            const jsxText: JSXText = {
              ...normalizeNode(start, end),
              type: 'JSXText',
              value: node.value,
            }
            return jsxText
          }

          if (
            node.type !== 'mdxJsxTextElement' &&
            node.type !== 'mdxJsxFlowElement'
          ) {
            return
          }

          const children = handleChildren(node)

          // keep for debugging
          // if (+1 === 1) {
          //   throw new SyntaxError(JSON.stringify({ node, children }, null, 2))
          // }

          const nodePos = node.position

          const nodeStart = nodePos.start.offset
          const nodeEnd = nodePos.end.offset

          const lastCharOffset = prevCharOffset(nodeEnd - 2)

          let expression: BaseExpression

          if ('name' in node && node.name) {
            const nodeNameLength = node.name.length
            const nodeNameStart = nextCharOffset(nodeStart + 1)

            const selfClosing = text[lastCharOffset] === '/'

            let lastAttrOffset = nodeNameStart + nodeNameLength - 1

            let closingElement: JSXClosingElement | null = null

            if (!selfClosing) {
              const prevOffset = prevCharOffset(lastCharOffset)
              const slashOffset = prevCharOffset(prevOffset - nodeNameLength)
              assert(
                text[slashOffset] === '/',
                `expect \`${text[slashOffset]}\` to be \`/\`, the node is ${node.name}`,
              )
              const tagStartOffset = prevCharOffset(slashOffset - 1)
              assert(text[tagStartOffset] === '<')
              closingElement = {
                ...normalizeNode(tagStartOffset, nodeEnd),
                type: 'JSXClosingElement',
                name: handleJsxName(node.name, prevOffset + 1 - nodeNameLength),
              }
            }

            const jsxEl: JSXElement = {
              ...normalizeNode(nodeStart, nodeEnd),
              type: 'JSXElement',
              openingElement: {
                type: 'JSXOpeningElement',
                name: handleJsxName(node.name, nodeNameStart),
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
                      ...normalizeNode(attrStart, lastAttrOffset),
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

            const expectedNextChar = selfClosing ? '/' : '>'

            if (nextChar !== expectedNextChar) {
              nextOffset = /** @type {number} */ nextCharOffset(lastAttrOffset)
              nextChar = text[nextOffset]
            }

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
         * Copied from @see https://github.com/eslint/espree/blob/1584ddb00f0b4e3ada764ac86ae20e1480003de3/lib/espree.js#L227-L241
         */
        const templateElement = node

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
