import { TokenType, type Token } from 'acorn'
import { parse, postprocess, preprocess } from 'micromark'
import type { Extension } from 'micromark-util-types'

const tokenTypes = new Map<string, TokenType>()

const getTokenType = (label: string) => {
  let tokenType = tokenTypes.get(label)

  if (!tokenType) {
    tokenType = Object.assign(new TokenType(), { label })
    tokenTypes.set(label, tokenType)
  }

  return tokenType
}

/**
 * Generate lexical tokens for Markdown syntax using micromark's event stream.
 */
export const getMicromarkTokens = (
  code: string,
  extensions: Extension[] | undefined,
): Token[] => {
  const events = postprocess(
    parse({ extensions })
      .document()
      .write(preprocess()(code, undefined, true)),
  )
  const tokens: Token[] = []
  const stack: Array<{ end: number; hasChild: boolean; type: string }> = []

  for (const event of events) {
    const token = event[1]
    const type = token.type

    if (event[0] === 'enter') {
      stack.push({ end: token.end.offset, hasChild: false, type })
      continue
    }

    const parent = stack.pop()
    const child = stack.at(-1)

    if (child) {
      child.hasChild = true
    }

    if (
      !parent ||
      parent.hasChild ||
      parent.type.startsWith('mdx') ||
      parent.type.startsWith('lineEnding') ||
      parent.type === 'whitespace'
    ) {
      continue
    }

    const value = code.slice(token.start.offset, token.end.offset)

    if (!value.trim()) {
      continue
    }

    tokens.push({
      type: getTokenType(type),
      value,
      start: token.start.offset,
      end: token.end.offset,
      loc: {
        start: { line: token.start.line, column: token.start.column },
        end: { line: token.end.line, column: token.end.column },
      },
      range: [token.start.offset, token.end.offset],
    } as unknown as Token)
  }

  return tokens
}
