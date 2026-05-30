/* istanbul ignore file */

import type { Linter } from 'eslint'

import { base } from './base.js'
import { codeBlocks } from './code-blocks.js'
import { flat, flatCodeBlocks } from './flat.js'
import { overrides } from './overrides.js'
import { recommended } from './recommended.js'

export { base, codeBlocks, flat, flatCodeBlocks, overrides, recommended }

export const configs: {
  base: Linter.LegacyConfig
  'code-blocks': Linter.LegacyConfig
  codeBlocks: Linter.LegacyConfig
  // eslint-disable-next-line sonarjs/deprecation
  flat: Linter.FlatConfig
  // eslint-disable-next-line sonarjs/deprecation
  flatCodeBlocks: Linter.FlatConfig
  overrides: Linter.LegacyConfig
  recommended: Linter.LegacyConfig
} = {
  base,
  'code-blocks': codeBlocks,
  codeBlocks,
  flat,
  flatCodeBlocks,
  overrides,
  recommended,
}
