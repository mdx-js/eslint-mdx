import fs from 'fs'
import path from 'path'

import { cosmiconfigSync } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import type { FrozenProcessor } from 'unified'
import unified from 'unified'

import { arrayify } from './helpers'
import type { RemarkConfig, RemarkPlugin } from './types'

export const requirePkg = <T>(
  plugin: string,
  prefix: string,
  filePath?: string,
): T => {
  if (filePath && /^\.\.?([/\\]|$)/.test(plugin)) {
    plugin = path.resolve(path.dirname(filePath), plugin)
  }
  prefix = prefix.endsWith('-') ? prefix : prefix + '-'
  const packages = [
    plugin,
    plugin.startsWith('@')
      ? plugin.replace('/', '/' + prefix)
      : prefix + plugin,
  ]
  let error: Error
  for (const pkg of packages) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      return require(pkg) as T
    } catch (err) {
      if (!error) {
        error = err as Error
      }
    }
  }
  throw error
}

/**
 * Given a filepath, get the nearest path that is a regular file.
 * The filepath provided by eslint may be a virtual filepath rather than a file
 * on disk. This attempts to transform a virtual path into an on-disk path
 */
export const getPhysicalFilename = (filename: string): string => {
  try {
    if (fs.statSync(filename).isFile()) {
      return filename
    }
  } catch (err) {
    // https://github.com/eslint/eslint/issues/11989
    if ((err as { code: string }).code === 'ENOTDIR') {
      return getPhysicalFilename(path.dirname(filename))
    }
  }

  return filename
}

export const remarkProcessor = unified().use(remarkParse).freeze()

const explorer = cosmiconfigSync('remark', {
  packageProp: 'remarkConfig',
})

// @internal - exported for testing
export const processorCache = new Map<string, FrozenProcessor>()

export const getRemarkProcessor = (
  searchFrom: string,
  isMdx: boolean,
  ignoreRemarkConfig: boolean,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const initCacheKey = `${String(isMdx)}-${searchFrom}`

  let cachedProcessor = processorCache.get(initCacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

  const result: CosmiconfigResult = ignoreRemarkConfig
    ? null
    : explorer.search(searchFrom)

  const cacheKey = result ? `${String(isMdx)}-${result.filepath}` : ''

  cachedProcessor = processorCache.get(cacheKey)

  if (cachedProcessor) {
    return cachedProcessor
  }

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
        plugins.push([require.resolve('remark-lint-file-extension'), false])
      } catch {
        // just ignore if the package does not exist
      }
    }

    const initProcessor = remarkProcessor()
      .use({ settings })
      .use(remarkStringify)

    if (isMdx) {
      initProcessor.use(remarkMdx)
    }

    cachedProcessor = plugins
      .reduce((processor, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = arrayify(pluginWithSettings) as [
          RemarkPlugin,
          ...unknown[]
        ]
        return processor.use(
          /* istanbul ignore next */
          typeof plugin === 'string'
            ? requirePkg(plugin, 'remark', result.filepath)
            : plugin,
          ...pluginSettings,
        )
      }, initProcessor)
      .freeze()
  } else {
    const initProcessor = remarkProcessor().use(remarkStringify)

    if (isMdx) {
      initProcessor.use(remarkMdx)
    }

    cachedProcessor = initProcessor.freeze()
  }

  processorCache
    .set(initCacheKey, cachedProcessor)
    .set(cacheKey, cachedProcessor)

  return cachedProcessor
}
