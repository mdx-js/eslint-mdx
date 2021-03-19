import path from 'path'

import { cosmiconfigSync } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { arrayify } from 'eslint-mdx'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified from 'unified'

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

let searchSync: (searchFrom?: string) => CosmiconfigResult

export const remarkProcessor = unified().use(remarkParse).freeze()

export const getRemarkProcessor = (searchFrom: string, isMdx: boolean) => {
  if (!searchSync) {
    searchSync = cosmiconfigSync('remark', {
      packageProp: 'remarkConfig',
    }).search
  }

  let result: Partial<CosmiconfigResult>

  try {
    result = searchSync(searchFrom)
  } catch (err) {
    // https://github.com/eslint/eslint/issues/11989
    /* istanbul ignore if */
    if (
      (err as { code?: string }).code !== 'ENOTDIR' ||
      !/[/\\]\d+_[^/\\]*\.[\da-z]+$/i.test(searchFrom)
    ) {
      throw err
    }
    try {
      result = searchSync(path.dirname(searchFrom))
    } catch {
      /* istanbul ignore next */
      throw err
    }
  }

  /* istanbul ignore next */
  const { plugins = [], settings } = (result?.config ||
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
}
