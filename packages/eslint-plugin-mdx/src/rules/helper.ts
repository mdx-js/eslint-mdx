import path from 'path'

import { cosmiconfigSync } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified, { FrozenProcessor } from 'unified'

import { RemarkConfig } from './types'

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

let searchSync: (searchFrom?: string) => CosmiconfigResult
let remarkProcessor: FrozenProcessor

export const getRemarkProcessor = (searchFrom: string, isMdx: boolean) => {
  if (!searchSync) {
    searchSync = cosmiconfigSync('remark', {
      packageProp: 'remarkConfig',
    }).search
  }

  if (!remarkProcessor) {
    remarkProcessor = unified().use(remarkParse).freeze()
  }

  /* istanbul ignore next */
  const result: Partial<CosmiconfigResult> = searchSync(searchFrom) || {}
  /* istanbul ignore next */
  const { plugins = [], settings } = (result.config ||
    {}) as Partial<RemarkConfig>

  try {
    // disable this rule automatically since we already have a parser option `extensions`
    // eslint-disable-next-line node/no-extraneous-require
    plugins.push([require.resolve('remark-lint-file-extension'), false])
  } catch {
    // just ignore if the package does not exist
  }

  const initProcessor = remarkProcessor().use({ settings }).use(remarkStringify)

  if (isMdx) {
    initProcessor.use(remarkMdx)
  }

  return plugins
    .reduce((processor, pluginWithSettings) => {
      const [plugin, ...pluginSettings] = Array.isArray(pluginWithSettings)
        ? pluginWithSettings
        : [pluginWithSettings]
      return processor.use(
        /* istanbul ignore next */
        typeof plugin === 'string'
          ? requirePkg(plugin, 'remark', result.filepath)
          : plugin,
        ...pluginSettings,
      )
    }, initProcessor)
    .freeze()
}
