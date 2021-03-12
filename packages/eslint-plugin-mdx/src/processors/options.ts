/**
 * based on @link https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/src/processor_options.js
 */

import { ProcessorOptions } from './types'

export const processorOptions = {} as ProcessorOptions

// find Linter instance
const linterPath = Object.keys(require.cache).find(
  path =>
    path.endsWith('/eslint/lib/linter/linter.js') ||
    path.endsWith('\\eslint\\lib\\linter\\linter.js'),
)

/* istanbul ignore if */
if (!linterPath) {
  throw new Error('Could not find ESLint Linter in require cache')
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
type LinterConfig = import('eslint').Linter.Config
// eslint-disable-next-line @typescript-eslint/no-type-alias
type LintOptions = import('eslint').Linter.LintOptions

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { Linter } = require(linterPath) as typeof import('eslint')

// patch Linter#verify
// eslint-disable-next-line @typescript-eslint/unbound-method
const { verify } = Linter.prototype

Linter.prototype.verify = function (
  code: import('eslint').SourceCode | string,
  _config: LinterConfig,
  options: string | LintOptions,
) {
  const config = _config as LinterConfig & {
    extractConfig?(filename: string): LinterConfig
  }

  // fetch settings
  const settings =
    (config &&
      (typeof config.extractConfig === 'function'
        ? config.extractConfig(
            /* istanbul ignore next */
            typeof options === 'string' ? options : options.filename,
          )
        : config
      ).settings) ||
    {}

  processorOptions.lintCodeBlock = settings['mdx/lintCodeBlock'] === true

  // call original Linter#verify
  return verify.call(this, code, config, options as LintOptions)
}
