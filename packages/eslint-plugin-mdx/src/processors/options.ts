/**
 * based on @link https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/src/processor_options.js
 */

import type { Linter, SourceCode } from 'eslint'

import type { ProcessorOptions } from './types'

export const processorOptions = {} as ProcessorOptions

// find Linter instance
const linterPath = Object.keys(require.cache).find(path =>
  /([/\\])eslint\1lib(?:\1linter){2}\.js$/.test(path),
)

/* istanbul ignore if */
if (!linterPath) {
  throw new Error('Could not find ESLint Linter in require cache')
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const ESLinter = (require(linterPath) as typeof import('eslint')).Linter

// patch Linter#verify
// eslint-disable-next-line @typescript-eslint/unbound-method
const { verify } = ESLinter.prototype

ESLinter.prototype.verify = function (
  code: SourceCode | string,
  _config: Linter.Config,
  options: string | Linter.LintOptions,
) {
  const config = _config as Linter.Config & {
    extractConfig?(filename: string): Linter.Config
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

  processorOptions.lintCodeBlocks = settings['mdx/code-blocks'] === true

  // call original Linter#verify
  return verify.call(this, code, config, options as Linter.LintOptions)
}
