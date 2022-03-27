/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable unicorn/no-await-expression-member */
import type { Token } from 'acorn'
import { cosmiconfig } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import type { AST } from 'eslint'
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

const explorer = cosmiconfig('remark', {
  packageProp: 'remarkConfig',
})

export const processorCache = new Map<string, FrozenProcessor>()

const getRemarkMdxOptions = (tokens: Token[]): Options => ({
  acornOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
    ranges: true,
    onToken: tokens,
  },
})

export const getRemarkProcessor = async (
  searchFrom: string,
  ignoreRemarkConfig?: boolean,
  tokens?: Token[],
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const isMdx = !!tokens

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
      initProcessor.use(remarkMdx, getRemarkMdxOptions(tokens))
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
      initProcessor.use(remarkMdx, getRemarkMdxOptions(tokens))
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
    const tokens: Token[] = []

    const processor = await getRemarkProcessor(
      physicalFilename,
      ignoreRemarkConfig,
      isMdx ? tokens : undefined,
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

    return {
      root: processor.parse(fileOptions) as Parent,
      tokens: tokens.map(token => ({
        ...token,
        type: token.type.keyword,
      })) as AST.Token[],
    }
  },
)
