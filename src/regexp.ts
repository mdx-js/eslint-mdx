// based on https://github.com/mdx-js/mdx/blob/master/packages/remark-mdx/tag.js

const dotAllPolyfill = '[\0-\uFFFF]'
const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*'
const unquoted = '[^"\'=<>`\\u0000-\\u0020]+'
const singleQuoted = "'[^']*'"
const doubleQuoted = '"[^"]*"'
const jsProps = '{.*}'.replace('.', dotAllPolyfill)
const attributeValue =
  '(?:' +
  unquoted +
  '|' +
  singleQuoted +
  '|' +
  doubleQuoted +
  '|' +
  jsProps +
  ')'
const attribute =
  '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)'

const openTag = '<[A-Za-z]*[A-Za-z0-9\\.\\-]*' + attribute + '*\\s*>'
const closeTag = '<\\s*\\/[A-Za-z]*[A-Za-z0-9\\.\\-]*\\s*>'
const selfClosingTag = '<[A-Za-z]*[A-Za-z0-9\\.\\-]*' + attribute + '*\\s*\\/?>'
const comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->'
const commentOpen = '<(!---*)'
const commentClose = '(-*--)>'

export const OPEN_TAG_REGEX = new RegExp(`^(?:${openTag})$`)
export const CLOSE_TAG_REGEX = new RegExp(`^(?:${closeTag})$`)
export const OPEN_CLOSE_TAG_REGEX = new RegExp(
  `^(?:${openTag + '[\\s\\S]*' + closeTag})$`,
)
export const SELF_CLOSING_TAG_REGEX = new RegExp(`^(?:${selfClosingTag})$`)
export const COMMENT_REGEX = new RegExp(`^(?:${comment})$`)
export const COMMENT_CONTENT_REGEX = new RegExp(
  `${commentOpen}([\\s\\S]*?)${commentClose}`,
  'g',
)

export const isOpenTag = (text: string) => OPEN_TAG_REGEX.test(text)
export const isCloseTag = (text: string) => CLOSE_TAG_REGEX.test(text)
export const isOpenCloseTag = (text: string) => OPEN_CLOSE_TAG_REGEX.test(text)
export const isSelfClosingTag = (text: string) =>
  SELF_CLOSING_TAG_REGEX.test(text)
export const isComment = (text: string) => COMMENT_REGEX.test(text)
