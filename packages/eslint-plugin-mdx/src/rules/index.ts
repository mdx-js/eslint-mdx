/* istanbul ignore file */
import { emphasisMarker } from './emphasis-marker.js'
import { headingIncrement } from './heading-increment.js'
import { noDuplicateHeadings } from './no-duplicate-headings.js'
import { noEmphasisAsHeading } from './no-emphasis-as-heading.js'
import { noFileNameArticles } from './no-file-name-articles.js'
import { noFileNameConsecutiveDashes } from './no-file-name-consecutive-dashes.js'
import { noFileNameIrregularCharacters } from './no-file-name-irregular-characters.js'
import { noFileNameMixedCase } from './no-file-name-mixed-case.js'
import { noFileNameOuterDashes } from './no-file-name-outer-dashes.js'
import { noHeadingPunctuation } from './no-heading-punctuation.js'
import { noMultipleToplevelHeadings } from './no-multiple-toplevel-headings.js'
import { noShortcutReferenceImage } from './no-shortcut-reference-image.js'
import { noShortcutReferenceLink } from './no-shortcut-reference-link.js'
import { noUnusedDefinitions } from './no-unused-definitions.js'
import { remark } from './remark.js'
import { strongMarker } from './strong-marker.js'
import { unorderedListMarkerStyle } from './unordered-list-marker-style.js'

export type * from './types.js'

export {
  emphasisMarker,
  headingIncrement,
  noDuplicateHeadings,
  noEmphasisAsHeading,
  noFileNameArticles,
  noFileNameConsecutiveDashes,
  noFileNameIrregularCharacters,
  noFileNameMixedCase,
  noFileNameOuterDashes,
  noHeadingPunctuation,
  noMultipleToplevelHeadings,
  noShortcutReferenceImage,
  noShortcutReferenceLink,
  noUnusedDefinitions,
  remark,
  strongMarker,
  unorderedListMarkerStyle,
}

export const rules = {
  'emphasis-marker': emphasisMarker,
  'heading-increment': headingIncrement,
  'no-duplicate-headings': noDuplicateHeadings,
  'no-emphasis-as-heading': noEmphasisAsHeading,
  'no-file-name-articles': noFileNameArticles,
  'no-file-name-consecutive-dashes': noFileNameConsecutiveDashes,
  'no-file-name-irregular-characters': noFileNameIrregularCharacters,
  'no-file-name-mixed-case': noFileNameMixedCase,
  'no-file-name-outer-dashes': noFileNameOuterDashes,
  'no-heading-punctuation': noHeadingPunctuation,
  'no-multiple-toplevel-headings': noMultipleToplevelHeadings,
  'no-shortcut-reference-image': noShortcutReferenceImage,
  'no-unused-definitions': noUnusedDefinitions,
  'no-shortcut-reference-link': noShortcutReferenceLink,
  'strong-marker': strongMarker,
  'unordered-list-marker-style': unorderedListMarkerStyle,
  remark,
}
