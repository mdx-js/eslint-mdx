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

const isMdx = (type: string) => type.startsWith('mdxJsx')

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
  jsxTextRanges?: Array<{ end: number; start: number }>,
): Token[] => {
  const tokens: Token[] = []
  const lineStarts = [0]

  for (const match of code.matchAll(/\n/g)) {
    lineStarts.push(match.index + 1)
  }

  const getPoint = (offset: number) => {
    let low = 0
    let high = lineStarts.length - 1

    while (low < high) {
      const middle = Math.ceil((low + high) / 2)

      if (lineStarts[middle] <= offset) {
        low = middle
      } else {
        high = middle - 1
      }
    }

    return {
      line: low + 1,
      column: offset - lineStarts[low] + 1,
    }
  }

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
        isMdx(type) &&
        (type.endsWith('TagName') || type.endsWith('TagAttributeName'))
      ) {
        const trimmedEnd = start + code.slice(start, end).trimEnd().length
        pushToken(
          tt.jsxName,
          start,
          trimmedEnd,
          token.start,
          trimmedEnd === end ? token.end : getPoint(trimmedEnd),
        )
        emitted = true
      } else if (
        !skip &&
        isMdx(type) &&
        type.endsWith('TagAttributeValueLiteral')
      ) {
        pushToken(tt.string, start, end, token.start, token.end)
        emitted = true
      } else if (!skip && type.endsWith('TagMarker')) {
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
        (type.endsWith('TagClosingMarker') ||
          type.endsWith('TagSelfClosingMarker'))
      ) {
        pushToken(tt.slash, start, end, token.start, token.end)
        emitted = true
      } else if (!skip && type.endsWith('TagAttributeInitializerMarker')) {
        pushToken(tt.eq, start, end, token.start, token.end)
        emitted = true
      } else if (
        !skip &&
        (type.endsWith('ExpressionMarker') ||
          type.endsWith('ExpressionAttributeMarker'))
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
        const isJsxText =
          jsxTextRanges?.some(
            range => range.start <= start && range.end >= end,
          ) ?? false

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

  for (const range of jsxTextRanges || []) {
    if (
      tokens.some(token => token.start < range.end && token.end > range.start)
    ) {
      continue
    }

    pushToken(
      tt.jsxText,
      range.start,
      range.end,
      getPoint(range.start),
      getPoint(range.end),
      true,
    )
  }

  return tokens
}
/* eslint-enable sonarjs/cognitive-complexity */
