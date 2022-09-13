import type { Token, TokenType, tokTypes } from 'acorn'
import type { Root } from 'remark-mdx'
import type { visit as visitor } from 'unist-util-visit'
import { ok as assert } from 'uvu/assert'

import {
  getPositionAtFactory,
  nextCharOffsetFactory,
  prevCharOffsetFactory,
} from './helpers'

export const restoreTokens = (
  text: string,
  root: Root,
  tokens: Token[],
  tt: Record<string, TokenType> & typeof tokTypes,
  visit: typeof visitor,
) => {
  tokens = [...tokens]

  const getPositionAt = getPositionAtFactory(text)
  const prevCharOffset = prevCharOffsetFactory(text)
  const nextCharOffset = nextCharOffsetFactory(text)

  const newToken = (
    type: TokenType,
    start: number,
    end: number,
    value?: string,
  ): Token => ({
    type,
    value,
    start,
    end,
    loc: {
      start: getPositionAt(start),
      end: getPositionAt(end),
    },
    range: [start, end],
  })

  // eslint-disable-next-line sonarjs/cognitive-complexity
  visit(root, node => {
    if (
      node.type !== 'mdxFlowExpression' &&
      node.type !== 'mdxJsxFlowElement' &&
      node.type !== 'mdxJsxTextElement' &&
      node.type !== 'text'
    ) {
      return
    }

    const nodePos = node.position

    assert(nodePos)

    const nodeStart = nodePos.start.offset
    const nodeEnd = nodePos.end.offset

    const lastCharOffset = prevCharOffset(nodeEnd - 2)

    assert(nodeStart != null)
    assert(nodeEnd != null)

    if (node.type === 'mdxFlowExpression') {
      tokens.push(
        newToken(tt.braceL, nodeStart, nodeStart + 1),
        newToken(tt.braceR, nodeEnd - 1, nodeEnd),
      )

      return
    }

    if (node.type === 'text') {
      tokens.push(newToken(tt.jsxText, nodeStart, nodeEnd, node.value))
      return
    }

    tokens.push(newToken(tt.jsxTagStart, nodeStart, nodeStart + 1))

    const nodeName = node.name
    const nodeNameLength = nodeName?.length ?? 0

    const selfClosing = text[lastCharOffset] === '/'

    let nodeNameStart = nodeStart + 1

    if (nodeName) {
      nodeNameStart = nextCharOffset(nodeStart + 1)

      assert(nodeNameStart)

      tokens.push(
        newToken(
          tt.jsxName,
          nodeNameStart,
          nodeNameStart + nodeNameLength,
          nodeName,
        ),
      )
    }

    // will always add 1 in `nextCharOffset`, so we minus 1 here
    let lastAttrOffset = nodeNameStart + nodeNameLength - 1

    for (const attr of node.attributes) {
      // already handled by acorn
      if (attr.type === 'mdxJsxExpressionAttribute') {
        assert(attr.data)
        assert(attr.data.estree)
        assert(attr.data.estree.range)

        let [attrValStart, attrValEnd] = attr.data.estree.range

        attrValStart = prevCharOffset(attrValStart - 1)
        attrValEnd = nextCharOffset(attrValEnd)

        assert(text[attrValStart] === '{')
        assert(text[attrValEnd] === '}')

        lastAttrOffset = attrValEnd

        tokens.push(
          newToken(tt.braceL, attrValStart, attrValStart + 1),
          newToken(tt.braceR, attrValEnd, attrValEnd + 1),
        )

        continue
      }

      /**
       * not available yet
       * @see https://github.com/mdx-js/mdx/issues/2034
       */

      // const attrPos = attr.position

      // const attrStart = attrPos.start.offset
      // const attrEnd = attrPos.end.offset

      const attrStart = nextCharOffset(lastAttrOffset + 1)

      assert(attrStart != null)

      const attrName = attr.name
      const attrNameLength = attrName.length

      tokens.push(
        newToken(tt.jsxName, attrStart, attrStart + attrNameLength, attrName),
      )

      const attrValue = attr.value

      if (!attrValue) {
        lastAttrOffset = attrStart + attrNameLength
        continue
      }

      const attrEqualOffset = nextCharOffset(attrStart + attrNameLength)

      assert(text[attrEqualOffset] === '=')

      tokens.push(newToken(tt.eq, attrEqualOffset, attrEqualOffset + 1, '='))

      // `mdxJsxAttributeValueExpression`, already handled by acorn
      if (typeof attrValue === 'object') {
        const data = attrValue.data

        let [attrValStart, attrValEnd] = data.estree.range

        attrValStart = prevCharOffset(attrValStart - 1)
        attrValEnd = nextCharOffset(attrValEnd)

        assert(text[attrValStart] === '{')
        assert(text[attrValEnd] === '}')

        lastAttrOffset = attrValEnd

        tokens.push(
          newToken(tt.braceL, attrValStart, attrValStart + 1),
          newToken(tt.braceR, attrValEnd, attrValEnd + 1),
        )

        continue
      }

      const attrQuoteOffset = nextCharOffset(attrEqualOffset + 1)

      const attrQuote = text[attrQuoteOffset]

      assert(attrQuote === '"' || attrQuote === "'")

      tokens.push(
        newToken(
          tt.string,
          attrQuoteOffset,
          attrQuoteOffset + attrValue.length + 2,
          attrValue,
        ),
      )

      lastAttrOffset = nextCharOffset(attrQuoteOffset + attrValue.length + 1)

      assert(text[lastAttrOffset] === attrQuote)
    }

    let nextOffset = nextCharOffset(lastAttrOffset + 1)
    let nextChar = text[nextOffset]

    const expectedNextChar = selfClosing ? '/' : '>'

    if (nextChar !== expectedNextChar) {
      nextOffset = /** @type {number} */ nextCharOffset(lastAttrOffset)
      nextChar = text[nextOffset]
    }

    if (selfClosing) {
      tokens.push(newToken(tt.slash, nextOffset, nextOffset + 1, '/'))
    } else {
      assert(
        nextChar === '>',
        `\`nextChar\` must be '>' but actually is '${nextChar}'`,
      )

      const prevOffset = prevCharOffset(nodeEnd - 2)

      if (nodeName) {
        tokens.push(
          newToken(
            tt.jsxName,
            prevOffset + 1 - nodeNameLength,
            prevOffset + 1,
            nodeName,
          ),
        )
      }

      const slashOffset = prevCharOffset(prevOffset - nodeNameLength)

      assert(text[slashOffset] === '/')

      tokens.push(newToken(tt.slash, slashOffset, slashOffset + 1, '/'))

      const tagStartOffset = prevCharOffset(slashOffset - 1)

      assert(text[tagStartOffset] === '<')

      tokens.push(newToken(tt.jsxTagStart, tagStartOffset, tagStartOffset + 1))
    }

    tokens.push(newToken(tt.jsxTagEnd, nodeEnd - 1, nodeEnd))
  })

  tokens.push(newToken(tt.eof, text.length, text.length))

  return tokens
    .filter(
      t =>
        !(
          t.start === t.end &&
          (t.type === tt.braceL ||
            t.type === tt.braceR ||
            t.type === tt.parenL ||
            t.type === tt.parenR)
        ),
    )
    .sort((a, b) => a.start - b.start)
}
