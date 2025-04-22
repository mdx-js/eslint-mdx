/**
 * Based on @link
 * https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/src/processor_options.js
 */

import type * as ESLint from 'eslint'

import { cjsRequire } from '../helpers.js'

import type { ESLintMdxSettings, ProcessorOptions } from './types.js'

export const processorOptions = {} as ProcessorOptions

// find Linter instance
const linterPath = Object.keys(cjsRequire.cache).find(path =>
  /([/\\])eslint\1lib(?:\1linter){2}\.js$/.test(path),
)

/* istanbul ignore if */
if (!linterPath) {
  throw new Error('Could not find ESLint Linter in require cache')
}

export interface LinterConfig extends ESLint.Linter.LegacyConfig {
  extractConfig?(filename?: string): ESLint.Linter.LegacyConfig
}

const ESLinter = cjsRequire<typeof ESLint>(linterPath).Linter

// patch Linter#verify

// eslint-disable-next-line @typescript-eslint/unbound-method
const { verify } = ESLinter.prototype

ESLinter.prototype.verify = function (
  code: ESLint.SourceCode | string,
  config: LinterConfig,
  options?: ESLint.Linter.LintOptions | string,
) {
  // fetch settings
  /* istanbul ignore next */
  const settings = ((
    config.extractConfig?.(
      // eslint-disable-next-line unicorn/no-typeof-undefined
      typeof options === 'undefined' || typeof options === 'string'
        ? options
        : options.filename,
    ) ?? config
  ).settings ?? {}) as ESLintMdxSettings

  processorOptions.lintCodeBlocks = settings['mdx/code-blocks'] === true
  processorOptions.languageMapper = settings['mdx/language-mapper']

  // call original Linter#verify
  return verify.call(this, code, config, options as ESLint.Linter.LintOptions)
}
