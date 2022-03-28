/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable unicorn/no-await-expression-member */
import path from 'path'

import type { Comment, Token } from 'acorn'
import { cosmiconfig } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import type { AST } from 'eslint'
import type { EsprimaToken } from 'espree/lib/token-translator'
import type { Comment as EsComment } from 'estree'
import type { Options } from 'micromark-extension-mdx-expression'
import { runAsWorker } from 'synckit'
import type { FrozenProcessor } from 'unified'
import type { Parent } from 'unist'
import type { VFileMessage } from 'vfile-message'

import { arrayify, loadEsmModule, requirePkg } from './helpers'
import type {
  RemarkConfig,
  RemarkPlugin,
  WorkerOptions,
  WorkerResult,
} from './types'

let acorn: typeof import('acorn')
let tokTypes: typeof import('acorn')['tokTypes']
let jsxTokTypes: Record<string, import('acorn').TokenType>
let TokenTranslator: typeof import('espree/lib/token-translator')['default']

const explorer = cosmiconfig('remark', {
  packageProp: 'remarkConfig',
})

export const processorCache = new Map<string, FrozenProcessor>()

const getRemarkMdxOptions = (
  tokens: Token[],
  comments: Comment[],
): Options => ({
  acornOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
    ranges: true,
    onToken: tokens,
    onComment: comments,
  },
})

const sharedTokens: Token[] = []
const sharedComments: Comment[] = []

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

  const cacheKey = result ? `${String(isMdx)}-${result.filepath}` : ''

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
    const { plugins = [], settings } = (result.config ||
      {}) as Partial<RemarkConfig>

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
      initProcessor.use(
        remarkMdx,
        getRemarkMdxOptions(sharedTokens, sharedComments),
      )
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
            ? await requirePkg(plugin, 'remark', result.filepath)
            : plugin,
          ...pluginSettings,
        )
      }, Promise.resolve(initProcessor))
    ).freeze()
  } else {
    const initProcessor = remarkProcessor().use(remarkStringify)

    if (isMdx) {
      initProcessor.use(
        remarkMdx,
        getRemarkMdxOptions(sharedTokens, sharedComments),
      )
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
  }: WorkerOptions): Promise<WorkerResult> => {
    sharedTokens.length = 0
    sharedComments.length = 0

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
        if (!file.messages.includes(err as VFileMessage)) {
          file.message(
            // @ts-expect-error - Error is fine
            err,
          ).fatal = true
        }
      }

      return {
        messages: JSON.parse(JSON.stringify(file.messages)) as VFileMessage[],
        content: file.toString(),
      }
    }

    /**
     * unified plugins are using ESM version of acorn,
     * so we have to use the same version as well,
     * otherwise the TokenType will be different class
     * @see also https://github.com/acornjs/acorn-jsx/issues/133
     */
    if (!acorn) {
      acorn = await loadEsmModule<typeof import('acorn')>('acorn')
    }

    if (!tokTypes) {
      tokTypes = acorn.tokTypes
    }

    if (!jsxTokTypes) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      jsxTokTypes = (
        await loadEsmModule<{ default: typeof import('acorn-jsx') }>(
          'acorn-jsx',
        )
      ).default(
        {
          allowNamespacedObjects: true,
        },
        // @ts-expect-error
      )(acorn.Parser).acornJsx.tokTypes
    }

    if (!TokenTranslator) {
      TokenTranslator = (
        await loadEsmModule<typeof import('espree/lib/token-translator')>(
          path.resolve(
            require.resolve('espree/package.json'),
            '../lib/token-translator.js',
          ),
        )
      ).default
    }

    const tokenTranslator = new TokenTranslator(
      {
        ...tokTypes,
        ...jsxTokTypes,
      },
      fileOptions.value as string,
    )

    const root = processor.parse(fileOptions) as Parent

    const tokens: AST.Token[] = []

    for (const token of sharedTokens) {
      tokenTranslator.onToken(token, {
        ecmaVersion: 13,
        tokens: tokens as EsprimaToken[],
      })
    }

    return {
      root,
      tokens,
      comments: sharedComments as EsComment[],
    }
  },
)
