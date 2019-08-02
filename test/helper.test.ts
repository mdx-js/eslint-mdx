import { first, mdxProcessor, normalizeJsxNode } from '../src'

import { Node } from 'unist'

describe('helper', () => {
  it('should transform html style comment in jsx into jsx comment', () => {
    const sourceText = `<Comment><!-- JSX Comment --><!-- JSX Comment --></Comment>`
    const expectText = `<Comment>{/** JSX Comment */}{/** JSX Comment */}</Comment>`
    expect(
      normalizeJsxNode(
        first(mdxProcessor.parse(sourceText).children as Node[]),
      ),
    ).toEqual({
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
})
