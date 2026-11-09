/* istanbul ignore file */
import { emphasisMarker } from './emphasis-marker.js'
import { headingIncrement } from './heading-increment.js'
import { noHeadingPunctuation } from './no-heading-punctuation.js'
import { remark } from './remark.js'
import { strongMarker } from './strong-marker.js'
import { unorderedListMarkerStyle } from './unordered-list-marker-style.js'

export type * from './types.js'

export {
  emphasisMarker,
  headingIncrement,
  noHeadingPunctuation,
  remark,
  strongMarker,
  unorderedListMarkerStyle,
}

export const rules = {
  'emphasis-marker': emphasisMarker,
  'heading-increment': headingIncrement,
  'no-heading-punctuation': noHeadingPunctuation,
  'strong-marker': strongMarker,
  'unordered-list-marker-style': unorderedListMarkerStyle,
  remark,
}
