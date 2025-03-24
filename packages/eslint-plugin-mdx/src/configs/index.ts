/* istanbul ignore file */

import { base } from './base.js'
import { codeBlocks } from './code-blocks.js'
import { flat, flatCodeBlocks } from './flat.js'
import { overrides } from './overrides.js'
import { recommended } from './recommended.js'

export { base, codeBlocks, flat, flatCodeBlocks, overrides, recommended }

export const configs = {
  base,
  'code-blocks': codeBlocks,
  codeBlocks,
  flat,
  flatCodeBlocks,
  overrides,
  recommended,
}
