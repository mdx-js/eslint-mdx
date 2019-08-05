import { first, mdxProcessor } from 'eslint-mdx'

import { parser } from './helper'

import { Node } from 'unist'

export const stringToNode = (text: string) =>
  first(mdxProcessor.parse(text).children as Node[])

describe('parser', () => {
  it('should transform html style comment in jsx into jsx comment', () => {
    const sourceText = `<Comment><!-- JSX Comment --><!-- JSX Comment --></Comment>`
    const expectText = `<Comment>{/** JSX Comment */}{/** JSX Comment */}</Comment>`
    expect(parser.normalizeJsxNode(stringToNode(sourceText))).toEqual({
      type: 'jsx',
      data: {
        jsxType: 'JSXElementWithHTMLComments',
        comments: [
          {
            fixed: '{/** JSX Comment */}',
            loc: {
              end: {
                column: 29,
                line: 0,
                offset: 29,
              },
              start: {
                column: 9,
                line: 1,
                offset: 9,
              },
            },
            origin: '<!-- JSX Comment -->',
          },
          {
            fixed: '{/** JSX Comment */}',
            loc: {
              end: {
                column: 49,
                line: 0,
                offset: 49,
              },
              start: {
                column: 29,
                line: 1,
                offset: 29,
              },
            },
            origin: '<!-- JSX Comment -->',
          },
        ],
        inline: false,
      },
      value: expectText,
      position: {
        end: {
          column: 60,
          line: 1,
          offset: 59,
        },
        indent: [],
        start: {
          column: 1,
          line: 1,
          offset: 0,
        },
      },
    })
  })

  it('should parse adjacent JSX nodes correctly', () => {
    const sourceText = `<header>Header</header><main>Main Content</main>`

    const parsedNodes = parser.normalizeJsxNode(stringToNode(sourceText))

    expect(parsedNodes.length).toBe(2)
    expect(parsedNodes).toMatchObject([
      {
        type: 'jsx',
        value: `<header>Header</header>`,
        position: {
          start: { line: 1, column: 0, offset: 0 },
          end: { line: 1, column: 23, offset: 23 },
        },
      },
      {
        type: 'jsx',
        value: `<main>Main Content</main>`,
        position: {
          start: { line: 1, column: 23, offset: 23 },
          end: { line: 1, column: 48, offset: 48 },
        },
      },
    ])
  })
})
