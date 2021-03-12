import path from 'path'

import { cosmiconfigSync } from 'cosmiconfig'
import { CosmiconfigResult } from 'cosmiconfig/dist/types'
import { AST, Rule } from 'eslint'
import {
  DEFAULT_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  hasProperties,
} from 'eslint-mdx'
// eslint-disable-next-line node/no-extraneous-import
import { Position } from 'estree'
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
  let result: Partial<CosmiconfigResult> = {}

  try {
    result = searchSync(searchFrom)
  } catch (err) {
    // https://github.com/eslint/eslint/issues/11989
    /* istanbul ignore if */
    if (
      (err as { code?: string }).code !== 'ENOTDIR' ||
      !/\d+\.[a-z]+$/.test(searchFrom)
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

export const parseContext = (context: Rule.RuleContext) => {
  const filename = context.getFilename()
  const extname = path.extname(filename)
  const sourceCode = context.getSourceCode()
  const options = context.parserOptions as {
    extensions: string[]
    markdownExtensions: string[]
  }
  const isMdx = DEFAULT_EXTENSIONS.concat(options.extensions || []).includes(
    extname,
  )
  const isMarkdown = MARKDOWN_EXTENSIONS.concat(
    options.markdownExtensions || [],
  ).includes(extname)

  return {
    filename,
    extname,
    sourceCode,
    options,
    isMdx,
    isMarkdown,
  }
}

export function getRangeByLoc(text: string, position: Position): number
export function getRangeByLoc(
  text: string,
  loc: AST.SourceLocation,
): [number, number]
export function getRangeByLoc(
  text: string,
  locOrPos: AST.SourceLocation | Position,
) {
  if (hasProperties<AST.SourceLocation>(locOrPos, ['start', 'end'])) {
    return [
      getRangeByLoc(text, locOrPos.start),
      getRangeByLoc(text, locOrPos.end),
    ]
  }

  const lines = text.split(/\n/)
  return lines.slice(0, locOrPos.line - 1).join('\n').length + locOrPos.column
}
