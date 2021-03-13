/* istanbul ignore file */

import { base } from './base'
import { codeBlocks } from './code-blocks'
import { overrides } from './overrides'
import { recommended } from './recommended'

export * from './helpers'

export { base, codeBlocks, overrides, recommended }

export const configs = {
  base,
  'code-blocks': codeBlocks,
  codeBlocks,
  overrides,
  recommended,
}
