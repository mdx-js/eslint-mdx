import path from 'path'

import cosmiconfig, { CosmiconfigResult, Explorer } from 'cosmiconfig'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified, { Processor } from 'unified'

import { RemarkConfig } from './types'

export const requirePkg = (
  plugin: string,
  prefix: string,
  filePath?: string,
) => {
  if (filePath && /^\.\.?([\\/]|$)/.test(plugin)) {
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
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      return require(pkg)
    } catch (err) {
      if (!error) {
        error = err
      }
    }
  }
  throw error
}

let remarkConfig: Explorer
let remarkProcessor: Processor

export const getRemarkProcessor = (searchFrom: string) => {
  if (!remarkConfig) {
    remarkConfig = cosmiconfig('remark', {
      packageProp: 'remarkConfig',
    })
  }

  if (!remarkProcessor) {
    remarkProcessor = unified()
      .use(remarkParse)
      .freeze()
  }

  /* istanbul ignore next */
  const { config, filepath }: Partial<CosmiconfigResult> =
    remarkConfig.searchSync(searchFrom) || {}
  /* istanbul ignore next */
  const { plugins = [], settings }: Partial<RemarkConfig> = config || {}

  try {
    // disable this rule automatically since we already have a parser option `extensions`
    // eslint-disable-next-line node/no-extraneous-require
    plugins.push([require.resolve('remark-lint-file-extension'), false])
  } catch (e) {
    // just ignore if the package does not
  }

  return plugins
    .reduce(
      (processor, pluginWithSettings) => {
        const [plugin, ...pluginSettings] = Array.isArray(pluginWithSettings)
          ? pluginWithSettings
          : [pluginWithSettings]
        return processor.use(
          /* istanbul ignore next */
          typeof plugin === 'string'
            ? requirePkg(plugin, 'remark', filepath)
            : plugin,
          ...pluginSettings,
        )
      },
      remarkProcessor()
        .use({ settings })
        .use(remarkStringify)
        .use(remarkMdx),
    )
    .freeze()
}
