/* istanbul ignore file */
import { emphasisMarker } from './emphasis-marker.js'
import { headingIncrement } from './heading-increment.js'
import { noDuplicateHeadings } from './no-duplicate-headings.js'
import { noHeadingPunctuation } from './no-heading-punctuation.js'
import { noShortcutReferenceImage } from './no-shortcut-reference-image.js'
import { noShortcutReferenceLink } from './no-shortcut-reference-link.js'
import { remark } from './remark.js'
import { strongMarker } from './strong-marker.js'
import { unorderedListMarkerStyle } from './unordered-list-marker-style.js'

export type * from './types.js'

export {
  emphasisMarker,
  headingIncrement,
  noDuplicateHeadings,
  noHeadingPunctuation,
  noShortcutReferenceImage,
  noShortcutReferenceLink,
  remark,
  strongMarker,
  unorderedListMarkerStyle,
}

export const rules = {
  'emphasis-marker': emphasisMarker,
  'heading-increment': headingIncrement,
  'no-duplicate-headings': noDuplicateHeadings,
  'no-heading-punctuation': noHeadingPunctuation,
  'no-shortcut-reference-image': noShortcutReferenceImage,
  'no-shortcut-reference-link': noShortcutReferenceLink,
  'strong-marker': strongMarker,
  'unordered-list-marker-style': unorderedListMarkerStyle,
  remark,
}
