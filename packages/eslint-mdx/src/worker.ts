/* eslint-disable unicorn-x/no-await-expression-member */

import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import type { Parser, Token, TokenType, tokTypes as _tokTypes } from 'acorn'
import * as acorn from 'acorn'
import acornJsx from 'acorn-jsx'
import { ok as assert } from 'devlop'
import type { AST } from 'eslint'
import type * as TokenTranslator_ from 'espree/lib/token-translator'
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
  JSXEmptyExpression,
  JSXExpressionContainer,
  JSXFragment,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXText,
} from 'estree-jsx'
import { visit as visitEstree } from 'estree-util-visit'
import type { Nodes, Root } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import type { Options } from 'micromark-extension-mdx-expression'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { extractProperties, runAsWorker } from 'synckit'
import { unified, type Processor } from 'unified'
import type { ConfigResult } from 'unified-engine'
import { Configuration } from 'unified-engine'
import { visit } from 'unist-util-visit'
import { VFile, type VFileOptions } from 'vfile'
import type { VFileMessage } from 'vfile-message'

import {
  cjsRequire,
  nextCharOffsetFactory,
  normalizePosition,
  prevCharOffsetFactory,
} from './helpers.js'
import { getTokens, type MicromarkEvent } from './tokens.js'
import type {
  Arrayable,
  IgnoreClass,
  MDCode,
  MDContentNode,
  MDHeading,
  MDListItem,
  MDTableCell,
  MDTableRow,
  NormalPosition,
  WorkerOptions,
  WorkerResult,
} from './types.js'

// JSXEmptyExpression is a standard ESTree node, so it has no `raw` extension.
const normalizeEmptyExpression = (
  start: number,
  end: number,
  code: string,
): JSXEmptyExpression => ({
  ...normalizePosition({
    start: { offset: start + 1 },
    end: { offset: end - 1 },
    code,
  }),
  type: 'JSXEmptyExpression',
})

const appendEstreeBody = (
  body: Program['body'],
  node: Nodes,
  estree: Program,
  code: string,
) => {
  if (node.type !== 'mdxFlowExpression' && node.type !== 'mdxTextExpression') {
    body.push(...estree.body)
    return
  }

  const type =
    node.type === 'mdxFlowExpression'
      ? 'MDXFlowExpression'
      : 'MDXTextExpression'
  const position = normalizePosition(node.position)

  if (estree.body.length === 0) {
    const {
      start: { offset: start },
      end: { offset: end },
    } = node.position
    body.push({
      ...position,
      type,
      expression: normalizeEmptyExpression(start, end, code),
    })
    return
  }

  for (const statement of estree.body) {
    if (statement.type === 'ExpressionStatement') {
      body.push({
        ...position,
        type,
        expression: statement.expression,
      })
    } else {
      body.push(statement)
    }
  }
}

let acornParser: typeof Parser

let tokTypes: typeof _tokTypes
let jsxTokTypes: Record<string, TokenType>
let tt: Record<string, TokenType> & typeof _tokTypes

let TokenTranslator: (typeof TokenTranslator_)['default']

export const processorCache = new Map<
  string,
  Processor<Root, undefined, undefined, Root, string>
>()

const configLoadCache = new Map<
  string,
  (filePath: string) => Promise<ConfigResult>
>()

let Ignore: IgnoreClass

const ignoreCheckCache = new Map<
  string,
  (filePath: string) => Promise<boolean>
>()

const getRemarkConfig = async (
  filePath: string,
  cwd: string,
  remarkConfigPath?: string,
) => {
  const cacheKey = remarkConfigPath ? `${cwd}\0${remarkConfigPath}` : cwd

  let configLoad = configLoadCache.get(cacheKey)

  if (!configLoad) {
    const config = new Configuration({
      cwd,
      packageField: 'remarkConfig',
      pluginPrefix: 'remark',
      rcName: '.remarkrc',
      rcPath: remarkConfigPath,
      detectConfig: true,
    })
    configLoad = promisify(config.load.bind(config))
    configLoadCache.set(cacheKey, configLoad)
  }

  if (!Ignore) {
    ;({ Ignore } = (await import(
      pathToFileURL(
        path.resolve(cjsRequire.resolve('unified-engine'), '../lib/ignore.js'),
      ).href
    )) as { Ignore: IgnoreClass })
  }

  let ignoreCheck = ignoreCheckCache.get(cacheKey)

  if (!ignoreCheck) {
    const ignore = new Ignore({
      cwd,
      ignoreName: '.remarkignore',
      detectIgnore: true,
    })
    ignoreCheck = promisify(ignore.check.bind(ignore))
    ignoreCheckCache.set(cacheKey, ignoreCheck)
  }

  return configLoad(filePath)
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
  filePath: string,
  isMdx: boolean,
  ignoreRemarkConfig?: boolean,
  cwd = process.cwd(),
  remarkConfigPath?: string,
) => {
  const initCacheKey = `${String(isMdx)}-${cwd}\0${filePath}`

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result = ignoreRemarkConfig
    ? null
    : await getRemarkConfig(filePath, cwd, remarkConfigPath)

  const cacheKey = result?.filePath
    ? `${String(isMdx)}-${result.filePath}`
    : String(isMdx)

  cachedProcessor = processorCache.get(cacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

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
          (await import('remark-lint-file-extension')).default,
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

function isExpressionStatement(
  statement: Program['body'][number],
): asserts statement is ExpressionStatement | undefined {
  assert(!statement || statement.type === 'ExpressionStatement')
}

runAsWorker(
  async ({
    filePath,
    code,
    cwd,
    isMdx,
    process,
    ignoreRemarkConfig,
    remarkConfigPath,
    // eslint-disable-next-line sonarjs/cognitive-complexity
  }: WorkerOptions): Promise<WorkerResult> => {
    sharedTokens.length = 0

    /**
     * Unified plugins are using ESM version of acorn, so we have to use the
     * same version as well, otherwise the TokenType will be different class
     *
     * @see also https://github.com/acornjs/acorn-jsx/issues/133
     */
    if (!acornParser) {
      acornParser = acorn.Parser.extend(acornJsx())
    }

    const processor = await getRemarkProcessor(
      filePath,
      isMdx,
      ignoreRemarkConfig,
      cwd,
      remarkConfigPath,
    )

    const fileOptions: VFileOptions = {
      path: filePath,
      value: code,
      cwd,
    }

    if (process) {
      const cacheKey = remarkConfigPath ? `${cwd}\0${remarkConfigPath}` : cwd

      if (await ignoreCheckCache.get(cacheKey)(filePath)) {
        return {
          messages: [],
        }
      }

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
        messages: file.messages.map(
          message => extractProperties(message) as VFileMessage,
        ),
        content: file.toString(),
      }
    }

    if (!tokTypes) {
      tokTypes = acorn.tokTypes
    }

    if (!jsxTokTypes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jsxTokTypes = acornJsx({
        allowNamespacedObjects: true,
        // @ts-expect-error -- no type
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      })(acorn.Parser).acornJsx.tokTypes
    }

    if (!TokenTranslator) {
      TokenTranslator = (
        (await import(
          pathToFileURL(
            path.resolve(
              cjsRequire.resolve('espree/package.json'),
              '../lib/token-translator.js',
            ),
          ).href
        )) as typeof TokenTranslator_
      ).default
    }

    if (!tt) {
      tt = {
        ...tokTypes,
        ...jsxTokTypes,
      }
    }

    const tokenTranslator = new TokenTranslator(tt, code)

    const events: MicromarkEvent[] = []
    const root = fromMarkdown(code, {
      ...processor.data('settings'),
      extensions: processor.data('micromarkExtensions') || [],
      mdastExtensions: [
        ...(processor.data('fromMarkdownExtensions') || []),
        {
          afterExit(token: MicromarkEvent['token']) {
            events.push({ enter: false, token })
          },
          beforeEnter(token: MicromarkEvent['token']) {
            events.push({ enter: true, token })
          },
        },
      ],
    })
    const acornTokens = [...sharedTokens]
    const markdownTokens = getTokens(code, events, tt)

    const body: Program['body'] = []
    const comments: Comment[] = []
    const tokens: AST.Token[] = []

    if (isMdx) {
      const prevCharOffset = prevCharOffsetFactory(code)
      const nextCharOffset = nextCharOffsetFactory(code)

      const normalizeNode = (start: number, end: number) => ({
        ...normalizePosition({
          start: { offset: start },
          end: { offset: end },
          code,
        }),
        raw: code.slice(start, end),
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
            JSXIdentifier | JSXMemberExpression,
          property: handleJsxName(
            propertyName,
            start + lastPointIndex + 1,
          ) as JSXIdentifier,
        }
      }

      visit(root, (node, _index, parent) => {
        if (parent !== root) {
          return
        }

        function handleChildren(node: Nodes) {
          return 'children' in node
            ? node.children.reduce<JSXElement['children']>((acc, child) => {
                if (child.data && 'estree' in child.data && child.data.estree) {
                  const { estree } = child.data

                  assert(estree.body.length <= 1)

                  const statement = estree.body[0]

                  isExpressionStatement(statement)

                  const expression = statement?.expression

                  if (
                    child.type === 'mdxFlowExpression' ||
                    child.type === 'mdxTextExpression'
                  ) {
                    const {
                      start: { offset: start },
                      end: { offset: end },
                    } = child.position

                    const expressionContainer: JSXExpressionContainer = {
                      ...normalizeNode(start, end),
                      type: 'JSXExpressionContainer',
                      expression:
                        expression ||
                        normalizeEmptyExpression(start, end, code),
                    }
                    acc.push(expressionContainer)
                  } else if (expression) {
                    acc.push(expression as JSXElement['children'][number])
                  }

                  comments.push(...estree.comments)
                } else {
                  const expression = (handleNode(child) ??
                    convertContent(child)) as Arrayable<JSXElement['children']>
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

        // eslint-disable-next-line sonarjs/cognitive-complexity, sonarjs/function-return-type
        function handleNode(node: Nodes) {
          if (node.type === 'paragraph') {
            return handleChildren(node)
          }

          const {
            start: { offset: start },
            end: { offset: end },
          } = node.position

          if (node.type === 'code') {
            const { lang, meta, value } = node
            const mdCode: MDCode = {
              ...normalizeNode(start, end),
              type: 'MDCode',
              lang,
              meta,
              value,
            }
            return mdCode
          }

          if (node.type === 'heading') {
            const { depth } = node
            const mdHeading: MDHeading = {
              ...normalizeNode(start, end),
              type: 'MDHeading',
              depth,
              children: handleChildren(node),
            }
            return mdHeading
          }

          if (node.type === 'text') {
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

          const nodePos = node.position

          const nodeStart = nodePos.start.offset
          const nodeEnd = nodePos.end.offset

          const lastCharOffset = prevCharOffset(nodeEnd - 2)

          let expression: BaseExpression

          if ('name' in node && node.name) {
            const nodeNameLength = node.name.length
            const nodeNameStart = nextCharOffset(nodeStart + 1)

            const selfClosing = code[lastCharOffset] === '/'

            let lastAttrOffset = nodeNameStart + nodeNameLength - 1

            let closingElement: JSXClosingElement | null = null

            if (!selfClosing) {
              const prevOffset = prevCharOffset(lastCharOffset)
              const slashOffset = prevCharOffset(prevOffset - nodeNameLength)
              assert(
                code[slashOffset] === '/',
                `expect \`${code[slashOffset]}\` to be \`/\`, the node is ${node.name}`,
              )
              const tagStartOffset = prevCharOffset(slashOffset - 1)
              assert(code[tagStartOffset] === '<')
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

                    assert(code[attrValStart] === '{')
                    assert(code[attrValEnd] === '}')

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

                  assert(code[attrEqualOffset] === '=')

                  let attrValuePos: NormalPosition

                  if (typeof attrValue === 'string') {
                    const attrQuoteOffset = nextCharOffset(attrEqualOffset + 1)

                    const attrQuote = code[attrQuoteOffset]

                    assert(attrQuote === '"' || attrQuote === "'")

                    lastAttrOffset = nextCharOffset(
                      attrQuoteOffset + attrValue.length + 1,
                    )

                    assert(code[lastAttrOffset] === attrQuote)

                    attrValuePos = normalizeNode(
                      attrQuoteOffset,
                      lastAttrOffset + 1,
                    )
                  } else {
                    const data = attrValue.data

                    let [attrValStart, attrValEnd] = data.estree.range

                    attrValStart = prevCharOffset(attrValStart - 1)
                    attrValEnd = nextCharOffset(attrValEnd)

                    assert(code[attrValStart] === '{')
                    assert(code[attrValEnd] === '}')

                    lastAttrOffset = attrValEnd

                    attrValuePos = normalizeNode(attrValStart, attrValEnd + 1)
                  }

                  return {
                    ...normalizeNode(attrStart, lastAttrOffset + 1),
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
            let nextChar = code[nextOffset]

            const expectedNextChar = selfClosing ? '/' : '>'

            if (nextChar !== expectedNextChar) {
              nextOffset = /** @type {number} */ nextCharOffset(lastAttrOffset)
              nextChar = code[nextOffset]
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

        function convertChildren(node: Nodes): MDContentNode[] {
          const children: MDContentNode[] = []
          if ('children' in node) {
            for (const child of node.children) {
              const converted = convertContent(child)
              if (converted) {
                children.push(converted)
              }
            }
          }
          return children
        }

        function convertContent(node: Nodes): MDContentNode | undefined {
          const {
            start: { offset: start },
            end: { offset: end },
          } = node.position
          const position = normalizeNode(start, end)

          const nodeType = node.type as string
          if (
            nodeType === 'inlineMath' ||
            nodeType === 'math' ||
            nodeType === 'toml'
          ) {
            const extended = node as Nodes & {
              value: string
              meta?: string | null
            }
            if (nodeType === 'math') {
              return {
                ...position,
                type: 'MDMath',
                value: extended.value,
                meta: extended.meta,
              }
            }
            if (nodeType === 'inlineMath') {
              return {
                ...position,
                type: 'MDInlineMath',
                value: extended.value,
              }
            }
            return { ...position, type: 'MDToml', value: extended.value }
          }

          switch (node.type) {
            case 'text': {
              return { ...position, type: 'MDText', value: node.value }
            }
            case 'paragraph': {
              return {
                ...position,
                type: 'MDParagraph',
                children: convertChildren(node),
              }
            }
            case 'heading': {
              return {
                ...position,
                type: 'MDHeading',
                depth: node.depth,
                children: convertChildren(node),
              }
            }
            case 'list': {
              return {
                ...position,
                type: 'MDList',
                ordered: node.ordered,
                start: node.start,
                spread: node.spread,
                children: convertChildren(node) as MDListItem[],
              }
            }
            case 'listItem': {
              return {
                ...position,
                type: 'MDListItem',
                checked: node.checked,
                spread: node.spread,
                children: convertChildren(node),
              }
            }
            case 'blockquote': {
              return {
                ...position,
                type: 'MDBlockquote',
                children: convertChildren(node),
              }
            }
            case 'code': {
              return {
                ...position,
                type: 'MDCode',
                lang: node.lang,
                meta: node.meta,
                value: node.value,
              }
            }
            case 'inlineCode': {
              return { ...position, type: 'MDInlineCode', value: node.value }
            }
            case 'emphasis': {
              return {
                ...position,
                type: 'MDEmphasis',
                children: convertChildren(node),
              }
            }
            case 'strong': {
              return {
                ...position,
                type: 'MDStrong',
                children: convertChildren(node),
              }
            }
            case 'link': {
              return {
                ...position,
                type: 'MDLink',
                url: node.url,
                title: node.title,
                children: convertChildren(node),
              }
            }
            case 'image': {
              return {
                ...position,
                type: 'MDImage',
                url: node.url,
                title: node.title,
                alt: node.alt,
              }
            }
            case 'break': {
              return { ...position, type: 'MDBreak' }
            }
            case 'thematicBreak': {
              return { ...position, type: 'MDThematicBreak' }
            }
            case 'definition': {
              return {
                ...position,
                type: 'MDDefinition',
                identifier: node.identifier,
                label: node.label,
                url: node.url,
                title: node.title,
              }
            }
            case 'linkReference': {
              return {
                ...position,
                type: 'MDLinkReference',
                identifier: node.identifier,
                label: node.label,
                referenceType: node.referenceType,
                children: convertChildren(node),
              }
            }
            case 'imageReference': {
              return {
                ...position,
                type: 'MDImageReference',
                identifier: node.identifier,
                label: node.label,
                referenceType: node.referenceType,
                alt: node.alt,
              }
            }
            case 'delete': {
              return {
                ...position,
                type: 'MDDelete',
                children: convertChildren(node),
              }
            }
            case 'footnoteDefinition': {
              return {
                ...position,
                type: 'MDFootnoteDefinition',
                identifier: node.identifier,
                label: node.label,
                children: convertChildren(node),
              }
            }
            case 'footnoteReference': {
              return {
                ...position,
                type: 'MDFootnoteReference',
                identifier: node.identifier,
                label: node.label,
              }
            }
            case 'table': {
              return {
                ...position,
                type: 'MDTable',
                align: node.align,
                children: convertChildren(node) as MDTableRow[],
              }
            }
            case 'tableRow': {
              return {
                ...position,
                type: 'MDTableRow',
                children: convertChildren(node) as MDTableCell[],
              }
            }
            case 'tableCell': {
              return {
                ...position,
                type: 'MDTableCell',
                children: convertChildren(node),
              }
            }
            case 'yaml': {
              return { ...position, type: 'MDYaml', value: node.value }
            }
            case 'mdxFlowExpression':
            case 'mdxTextExpression': {
              const estree = node.data?.estree
              if (estree) {
                comments.push(...estree.comments)
              }
              const statement = estree?.body[0]
              isExpressionStatement(statement)
              if (!statement?.expression) {
                const {
                  start: { offset: start },
                  end: { offset: end },
                } = node.position
                return {
                  ...position,
                  type:
                    node.type === 'mdxFlowExpression'
                      ? 'MDXFlowExpression'
                      : 'MDXTextExpression',
                  expression: normalizeEmptyExpression(start, end, code),
                }
              }
              return {
                ...position,
                type:
                  node.type === 'mdxFlowExpression'
                    ? 'MDXFlowExpression'
                    : 'MDXTextExpression',
                expression: statement.expression,
              }
            }
            case 'mdxJsxFlowElement':
            case 'mdxJsxTextElement': {
              return handleNode(node) as MDContentNode
            }
            default: {
              return
            }
          }
        }

        if (
          node.type === 'mdxjsEsm' ||
          node.type === 'mdxFlowExpression' ||
          node.type === 'mdxTextExpression'
        ) {
          const estree = ((node.data &&
            'estree' in node.data &&
            node.data.estree) || {
            body: [],
            comments: [],
          }) as Program
          appendEstreeBody(body, node, estree, code)
          comments.push(...estree.comments)
          return
        }

        if (
          node.type === 'mdxJsxFlowElement' ||
          node.type === 'mdxJsxTextElement'
        ) {
          const expression = handleNode(node)

          if (expression) {
            body.push({
              ...normalizePosition(node.position),
              type: 'ExpressionStatement',
              expression: expression as Expression,
            })
          }
          return
        }

        const content = convertContent(node)

        if (content) {
          body.push(content as Program['body'][number])
        }
      })
    }

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
         * Copied from @see
         * https://github.com/eslint/espree/blob/1584ddb00f0b4e3ada764ac86ae20e1480003de3/lib/espree.js#L227-L241
         */
        const templateElement = node

        const startOffset = -1
        const endOffset = templateElement.tail ? 1 : 2

        templateElement.start += startOffset
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

    const seenTokens = new Set<string>()
    const tokensWithMarkdown = [
      ...acornTokens,
      ...markdownTokens.filter(
        markdownToken =>
          !acornTokens.some(
            token =>
              (token.start < markdownToken.end &&
                token.end > markdownToken.start) ||
              (token.start === markdownToken.start &&
                token.end === markdownToken.end),
          ),
      ),
    ]
      .filter(token => {
        const type =
          typeof token.type === 'string' ? token.type : token.type.label
        const key = `${token.start}:${token.end}:${type}`

        if (seenTokens.has(key)) {
          return false
        }

        seenTokens.add(key)
        return true
      })
      .sort((a, b) => a.start - b.start)

    for (const token of tokensWithMarkdown) {
      const tokenStart = tokens.length
      tokenTranslator.onToken(token, {
        ecmaVersion: 'latest',
        tokens: tokens as TokenTranslator_.EsprimaToken[],
      })

      const sourceType = token.type

      if (
        typeof sourceType !== 'string' &&
        !Object.values(tt).includes(sourceType)
      ) {
        for (let index = tokenStart; index < tokens.length; index++) {
          const translatedToken = tokens[index]

          if (
            translatedToken.range[0] === token.start &&
            translatedToken.range[1] === token.end
          ) {
            translatedToken.type = sourceType.label as AST.Token['type']
          }
        }
      }
    }

    return {
      root,
      body,
      comments,
      tokens,
    }
  },
)
