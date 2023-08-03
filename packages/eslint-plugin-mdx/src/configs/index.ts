/* istanbul ignore file */

import { base } from './base'
import { codeBlocks } from './code-blocks'
import { flat, flatCodeBlocks } from './flat'
import { overrides } from './overrides'
import { recommended } from './recommended'

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
