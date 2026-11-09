/* istanbul ignore file */
import { emphasisMarker } from './emphasis-marker.js'
import { headingIncrement } from './heading-increment.js'
import { remark } from './remark.js'

export type * from './types.js'

export { emphasisMarker, headingIncrement, remark }

export const rules = {
  'emphasis-marker': emphasisMarker,
  'heading-increment': headingIncrement,
  remark,
}
