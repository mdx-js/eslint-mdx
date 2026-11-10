/* istanbul ignore file */
import { codeBlockStyle } from './code-block-style.js'
import { definitionCase } from './definition-case.js'
import { definitionSpacing } from './definition-spacing.js'
import { emphasisMarker } from './emphasis-marker.js'
import { fencedCodeFlag } from './fenced-code-flag.js'
import { fencedCodeMarker } from './fenced-code-marker.js'
import { fileExtension } from './file-extension.js'
import { finalNewline } from './final-newline.js'
import { hardBreakSpaces } from './hard-break-spaces.js'
import { headingIncrement } from './heading-increment.js'
import { headingStyle } from './heading-style.js'
import { linkTitleStyle } from './link-title-style.js'
import { maximumHeadingLength } from './maximum-heading-length.js'
import { maximumLineLength } from './maximum-line-length.js'
import { noConsecutiveBlankLines } from './no-consecutive-blank-lines.js'
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
import { orderedListMarkerStyle } from './ordered-list-marker-style.js'
import { remark } from './remark.js'
import { ruleStyle } from './rule-style.js'
import { strongMarker } from './strong-marker.js'
import { unorderedListMarkerStyle } from './unordered-list-marker-style.js'

export type * from './types.js'

export {
  codeBlockStyle,
  definitionCase,
  definitionSpacing,
  emphasisMarker,
  fencedCodeFlag,
  fencedCodeMarker,
  fileExtension,
  finalNewline,
  hardBreakSpaces,
  headingIncrement,
  headingStyle,
  linkTitleStyle,
  maximumHeadingLength,
  maximumLineLength,
  noConsecutiveBlankLines,
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
  orderedListMarkerStyle,
  remark,
  ruleStyle,
  strongMarker,
  unorderedListMarkerStyle,
}

export const rules = {
  'emphasis-marker': emphasisMarker,
  'final-newline': finalNewline,
  'fenced-code-marker': fencedCodeMarker,
  'heading-increment': headingIncrement,
  'heading-style': headingStyle,
  'maximum-heading-length': maximumHeadingLength,
  'code-block-style': codeBlockStyle,
  'definition-case': definitionCase,
  'fenced-code-flag': fencedCodeFlag,
  'file-extension': fileExtension,
  'hard-break-spaces': hardBreakSpaces,
  'maximum-line-length': maximumLineLength,
  'definition-spacing': definitionSpacing,
  'no-consecutive-blank-lines': noConsecutiveBlankLines,
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
  'link-title-style': linkTitleStyle,
  'no-heading-punctuation': noHeadingPunctuation,
  'ordered-list-marker-style': orderedListMarkerStyle,
  'no-literal-urls': noLiteralUrls,
  'no-multiple-toplevel-headings': noMultipleToplevelHeadings,
  'no-shell-dollars': noShellDollars,
  'no-table-indentation': noTableIndentation,
  'no-shortcut-reference-image': noShortcutReferenceImage,
  'no-unused-definitions': noUnusedDefinitions,
  'rule-style': ruleStyle,
  'no-shortcut-reference-link': noShortcutReferenceLink,
  'strong-marker': strongMarker,
  'unordered-list-marker-style': unorderedListMarkerStyle,
  remark,
}
