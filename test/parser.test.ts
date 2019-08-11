// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../packages/eslint-mdx/typings.d.ts" />

import {
  first,
  mdxProcessor,
  parser,
  normalizeParser,
  ParserOptions,
} from 'eslint-mdx'
import { parse } from 'espree'

import { parserOptions, noop } from './helper'

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
                line: 1,
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
                line: 1,
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

  it('should throw on invalid parser', () => {
    ;[
      {
        parse: null,
      },
      {
        parseForEslint: null,
      },
    ].forEach(p =>
      expect(() =>
        parser.parse('<header>Header</header>', {
          ...parserOptions,
          parser: p as ParserOptions['parser'],
        }),
      ).toThrow('Invalid custom parser for `eslint-mdx`:'),
    )

    expect(() =>
      parser.parse('<header>Header</header>', {
        ...parserOptions,
        parser: noop as ParserOptions['parser'],
      }),
    ).toThrow("Cannot use 'in' operator to search for 'ast' in undefined")
  })

  it('should work with valid custom parser', () => {
    expect(() =>
      parser.parse('<header>Header</header>', {
        ...parserOptions,
        sourceType: null,
        parser: 'babel-eslint',
      }),
    ).not.toThrow()
  })

  it('should fallback to espree if no preferred parsers found', () => {
    jest.mock('@typescript-eslint/parser', noop).mock('babel-eslint', noop)
    expect(normalizeParser()).toBe(parse)
    jest.unmock('@typescript-eslint/parser').unmock('babel-eslint')
  })

  it('should throw on invalid es syntaxes', () => {
    expect(() =>
      parser.parse("import A from 'a'\nimport A from 'a'", parserOptions),
    ).toThrow("unknown: Identifier 'A' has already been declared")
    expect(() => parser.parse('<header><>\n</header>', parserOptions)).toThrow(
      'Expected corresponding closing tag for JSX fragment.',
    )
    expect(() => parser.parse('<h1></h2>', parserOptions)).toThrow(
      "Expected corresponding JSX closing tag for 'h1'.",
    )
    expect(() => parser.parse('Header\n<>', parserOptions)).toThrow(
      'JSX fragment has no corresponding closing tag.',
    )
    expect(() => parser.parse('<main><</main>', parserOptions)).toThrow(
      'Identifier expected.',
    )
    expect(() => parser.parse('<main>{<}</main>', parserOptions)).toThrow(
      'Expression expected.',
    )
    expect(() =>
      parser.parse('<main>\n<section><</section></main>', parserOptions),
    ).toThrow('Identifier expected.')
  })

  it('should not throw on adjacent JSX nodes', () => {
    expect(() =>
      parser.parse(
        '<header></header>\n<main><section>left</section><section>right<input name="name"/></section></main>',
        parserOptions,
      ),
    ).not.toThrow()
  })

  it('should be able to parse normal js file', () => {
    expect(() =>
      parser.parse("import A from 'a'", {
        ...parserOptions,
        filePath: 'test.js',
      }),
    ).not.toThrow()
    expect(() =>
      parser.parse('const a = {}', {
        ...parserOptions,
        filePath: 'test.js',
      }),
    ).not.toThrow()
  })
})
