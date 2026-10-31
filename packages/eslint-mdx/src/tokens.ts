import { TokenType, type Token, type tokTypes } from 'acorn'

const tokenTypes = new Map<string, TokenType>()

const getTokenType = (label: string) => {
  let tokenType = tokenTypes.get(label)

  if (!tokenType) {
    tokenType = new TokenType()
    tokenType.label = label
    tokenTypes.set(label, tokenType)
  }

  return tokenType
}

const isMdxJsxToken = (type: string, name: string) =>
  type === `mdxJsxFlow${name}` || type === `mdxJsxText${name}`

const isMdxExpressionMarker = (type: string) =>
  type === 'mdxFlowExpressionMarker' || type === 'mdxTextExpressionMarker'

const getTagMarkerType = (
  char: string,
  tt: Record<string, TokenType> & typeof tokTypes,
) => {
  if (char === '<') {
    return tt.jsxTagStart
  }
  if (char === '/') {
    return tt.slash
  }
  return tt.jsxTagEnd
}

/**
 * Generate the complete token stream for Markdown and MDX syntax.
 *
 * JavaScript tokens are provided by acorn; this function covers the Markdown
 * and MDX JSX/expression structure.
 */
export interface JsxTextRange {
  end: number
  endPoint: { column: number; line: number }
  start: number
  startPoint: { column: number; line: number }
}

export interface MicromarkEvent {
  enter: boolean
  token: {
    end: { column: number; line: number; offset: number }
    start: { column: number; line: number; offset: number }
    type: string
  }
}

/* eslint-disable sonarjs/cognitive-complexity -- event handling is switch-like */
export const getTokens = (
  code: string,
  events: MicromarkEvent[],
  tt: Record<string, TokenType> & typeof tokTypes,
  jsxTextRanges: JsxTextRange[] = [],
): Token[] => {
  const tokens: Token[] = []
  const stack: Array<{
    emitted: boolean
    end: number
    endPoint: { line: number; column: number }
    hasChild: boolean
    skip: boolean
    start: number
    startPoint: { line: number; column: number }
    type: string
  }> = []

  const pushToken = (
    type: TokenType,
    start: number,
    end: number,
    startPoint: { line: number; column: number },
    endPoint: { line: number; column: number },
    allowWhitespace = false,
  ) => {
    const value = code.slice(start, end)

    if (!allowWhitespace && !value.trim()) {
      return
    }

    tokens.push({
      type,
      value,
      start,
      end,
      loc: {
        start: { line: startPoint.line, column: startPoint.column - 1 },
        end: { line: endPoint.line, column: endPoint.column - 1 },
      },
      range: [start, end],
    })
  }

  for (const event of events) {
    const token = event.token
    const type = token.type
    const start = token.start.offset
    const end = token.end.offset

    if (event.enter) {
      const parent = stack.at(-1)
      const skip = parent?.skip ?? false
      let emitted = false

      if (parent) {
        parent.hasChild = true
      }

      if (
        !skip &&
        (isMdxJsxToken(type, 'TagName') ||
          isMdxJsxToken(type, 'TagAttributeName'))
      ) {
        const value = code.slice(start, end).trimEnd()
        const trimmedEnd = start + value.length
        const endPoint =
          trimmedEnd === end
            ? token.end
            : {
                line: token.start.line,
                column: token.start.column + value.length,
              }

        pushToken(tt.jsxName, start, trimmedEnd, token.start, endPoint)
        emitted = true
      } else if (!skip && isMdxJsxToken(type, 'TagAttributeValueLiteral')) {
        pushToken(tt.string, start, end, token.start, token.end)
        emitted = true
      } else if (!skip && isMdxJsxToken(type, 'TagMarker')) {
        pushToken(
          getTagMarkerType(code[start], tt),
          start,
          end,
          token.start,
          token.end,
        )
        emitted = true
      } else if (
        !skip &&
        (isMdxJsxToken(type, 'TagClosingMarker') ||
          isMdxJsxToken(type, 'TagSelfClosingMarker'))
      ) {
        pushToken(tt.slash, start, end, token.start, token.end)
        emitted = true
      } else if (
        !skip &&
        isMdxJsxToken(type, 'TagAttributeInitializerMarker')
      ) {
        pushToken(tt.eq, start, end, token.start, token.end)
        emitted = true
      } else if (
        !skip &&
        (isMdxExpressionMarker(type) ||
          isMdxJsxToken(type, 'TagExpressionAttributeMarker') ||
          isMdxJsxToken(type, 'TagAttributeValueExpressionMarker'))
      ) {
        pushToken(
          code[start] === '{' ? tt.braceL : tt.braceR,
          start,
          end,
          token.start,
          token.end,
        )
        emitted = true
      } else if (!skip && type === 'data') {
        const isJsxText = jsxTextRanges.some(
          range => range.start <= start && range.end >= end,
        )

        if (!isJsxText) {
          pushToken(getTokenType(type), start, end, token.start, token.end)
        }

        emitted = true
      }

      stack.push({
        emitted,
        end,
        endPoint: token.end,
        hasChild: false,
        skip: skip || emitted,
        start,
        startPoint: token.start,
        type,
      })
    } else {
      const frame = stack.pop()

      if (
        !frame ||
        frame.emitted ||
        frame.skip ||
        frame.hasChild ||
        frame.type.startsWith('mdx') ||
        frame.type.startsWith('lineEnding') ||
        frame.type === 'whitespace'
      ) {
        continue
      }

      pushToken(
        getTokenType(frame.type),
        frame.start,
        frame.end,
        frame.startPoint,
        frame.endPoint,
      )
    }
  }

  const sortedTokens = [...tokens].sort((a, b) => a.start - b.start)

  const toSourcePoint = (point: { column: number; line: number }) => ({
    column: point.column + 1,
    line: point.line,
  })

  for (const range of jsxTextRanges) {
    let cursor = range.start
    let cursorPoint = range.startPoint

    for (const token of sortedTokens) {
      if (token.end <= cursor || token.start >= range.end) {
        continue
      }

      if (token.start > cursor) {
        pushToken(
          tt.jsxText,
          cursor,
          token.start,
          cursorPoint,
          toSourcePoint(token.loc.start),
          true,
        )
      }

      if (token.end > cursor) {
        cursor = token.end
        cursorPoint = toSourcePoint(token.loc.end)
      }
    }

    if (cursor < range.end) {
      pushToken(
        tt.jsxText,
        cursor,
        range.end,
        cursorPoint,
        range.endPoint,
        true,
      )
    }
  }

  return tokens
}
/* eslint-enable sonarjs/cognitive-complexity */
