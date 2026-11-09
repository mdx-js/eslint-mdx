/* istanbul ignore file */
import { nativeEmphasisMarker, nativeHeadingIncrement } from './native.js'
import { remark } from './remark.js'

export type * from './types.js'

export { nativeEmphasisMarker, nativeHeadingIncrement, remark }

export const rules = {
  nativeEmphasisMarker,
  nativeHeadingIncrement,
  remark,
}
