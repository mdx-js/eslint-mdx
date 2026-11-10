/* istanbul ignore file */
import { emphasisMarker } from './emphasis-marker.js'
import { finalNewline } from './final-newline.js'
import { headingIncrement } from './heading-increment.js'
import { maximumHeadingLength } from './maximum-heading-length.js'
import { noDuplicateDefinitions } from './no-duplicate-definitions.js'
import { noDuplicateHeadingsInSection } from './no-duplicate-headings-in-section.js'
import { noDuplicateHeadings } from './no-duplicate-headings.js'
import { noEmphasisAsHeading } from './no-emphasis-as-heading.js'
import { noFileNameArticles } from './no-file-name-articles.js'
import { noFileNameConsecutiveDashes } from './no-file-name-consecutive-dashes.js'
import { noFileNameIrregularCharacters } from './no-file-name-irregular-characters.js'
import { noFileNameMixedCase } from './no-file-name-mixed-case.js'
import { noFileNameOuterDashes } from './no-file-name-outer-dashes.js'
import { noHeadingContentIndent } from './no-heading-content-indent.js'
import { noHeadingPunctuation } from './no-heading-punctuation.js'
import { noLiteralUrls } from './no-literal-urls.js'
import { noMultipleToplevelHeadings } from './no-multiple-toplevel-headings.js'
import { noShellDollars } from './no-shell-dollars.js'
import { noShortcutReferenceImage } from './no-shortcut-reference-image.js'
import { noShortcutReferenceLink } from './no-shortcut-reference-link.js'
import { noTableIndentation } from './no-table-indentation.js'
import { noUnusedDefinitions } from './no-unused-definitions.js'
import { remark } from './remark.js'
import { strongMarker } from './strong-marker.js'
import { unorderedListMarkerStyle } from './unordered-list-marker-style.js'

export type * from './types.js'

export {
  emphasisMarker,
  finalNewline,
  headingIncrement,
  maximumHeadingLength,
  noDuplicateDefinitions,
  noDuplicateHeadings,
  noDuplicateHeadingsInSection,
  noEmphasisAsHeading,
  noFileNameArticles,
  noFileNameConsecutiveDashes,
  noFileNameIrregularCharacters,
  noFileNameMixedCase,
  noFileNameOuterDashes,
  noHeadingContentIndent,
  noHeadingPunctuation,
  noLiteralUrls,
  noMultipleToplevelHeadings,
  noShellDollars,
  noShortcutReferenceImage,
  noShortcutReferenceLink,
  noTableIndentation,
  noUnusedDefinitions,
  remark,
  strongMarker,
  unorderedListMarkerStyle,
}

export const rules = {
  'emphasis-marker': emphasisMarker,
  'final-newline': finalNewline,
  'heading-increment': headingIncrement,
  'maximum-heading-length': maximumHeadingLength,
  'no-duplicate-definitions': noDuplicateDefinitions,
  'no-duplicate-headings': noDuplicateHeadings,
  'no-duplicate-headings-in-section': noDuplicateHeadingsInSection,
  'no-emphasis-as-heading': noEmphasisAsHeading,
  'no-file-name-articles': noFileNameArticles,
  'no-file-name-consecutive-dashes': noFileNameConsecutiveDashes,
  'no-file-name-irregular-characters': noFileNameIrregularCharacters,
  'no-file-name-mixed-case': noFileNameMixedCase,
  'no-file-name-outer-dashes': noFileNameOuterDashes,
  'no-heading-content-indent': noHeadingContentIndent,
  'no-heading-punctuation': noHeadingPunctuation,
  'no-literal-urls': noLiteralUrls,
  'no-multiple-toplevel-headings': noMultipleToplevelHeadings,
  'no-shell-dollars': noShellDollars,
  'no-table-indentation': noTableIndentation,
  'no-shortcut-reference-image': noShortcutReferenceImage,
  'no-unused-definitions': noUnusedDefinitions,
  'no-shortcut-reference-link': noShortcutReferenceLink,
  'strong-marker': strongMarker,
  'unordered-list-marker-style': unorderedListMarkerStyle,
  remark,
}
