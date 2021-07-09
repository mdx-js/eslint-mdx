/* eslint-disable sonarjs/no-duplicate-string */
import type { Node, Parent, ParserConfig, ParserOptions } from 'eslint-mdx'
import {
  DEFAULT_PARSER_OPTIONS as parserOptions,
  first,
  mdxProcessor,
  normalizeParser,
  parser,
} from 'eslint-mdx'

import { noop } from './helpers'

const stringToNode = (text: string) =>
  first((mdxProcessor.parse(text) as Parent).children)

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

    expect((parsedNodes as Node[]).length).toBe(2)
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
    const parserConfigs: ParserConfig[] = [
      {
        parse: null,
      },
      {
        // @ts-expect-error
        parseForEsLint: null,
      },
    ]
    for (const p of parserConfigs)
      expect(() =>
        parser.parse('<header>Header</header>', {
          ...parserOptions,
          parser: p,
        }),
      ).toThrowErrorMatchingSnapshot()

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
        sourceType: undefined,
        parser: '@babel/eslint-parser',
        babelOptions: {
          configFile: require.resolve('@1stg/babel-preset/config'),
        },
      }),
    ).not.toThrow()
  })

  it('should fallback to espree if no preferred parsers found', () => {
    jest
      .setMock('@typescript-eslint/parser', null)
      .setMock('@babel/eslint-parser', null)
      .mock('babel-eslint', noop, { virtual: true })
      .setMock('espree', { parse: noop })
    expect(normalizeParser()).toEqual([noop])
    jest.unmock('@typescript-eslint/parser').unmock('@babel/eslint-parser')
  })

  it('should throw on invalid es syntaxes', () => {
    expect(() =>
      parser.parse("import A from 'a'\nimport A from 'a'", parserOptions),
    ).toThrow("unknown: Identifier 'A' has already been declared")
    expect(() => parser.parse('<header><>\n</header>', parserOptions)).toThrow(
      'Expected corresponding JSX closing tag for <>',
    )
    expect(() => parser.parse('<h1></h2>', parserOptions)).toThrow(
      'Expected corresponding JSX closing tag for <h1>',
    )
    expect(() =>
      parser.parse('Header\n<>', {
        ...parserOptions,
        parser: '@typescript-eslint/parser',
      }),
    ).toThrowError()
    expect(() =>
      parser.parse('Header\n<>', {
        ...parserOptions,
        parser: '@babel/eslint-parser',
      }),
    ).toThrowError()
    expect(() => parser.parse('<main><</main>', parserOptions)).toThrow(
      'Unexpected token (1:10)',
    )
    expect(() => parser.parse('<main>{<}</main>', parserOptions)).toThrow(
      'Unexpected token (1:11)',
    )
    expect(() =>
      parser.parse('<main>\n<section><</section></main>', parserOptions),
    ).toThrow('Unexpected token (2:10)')
  })

  it('should not throw on adjacent JSX nodes', () =>
    expect(() =>
      parser.parse(
        '<header></header>\n<main><section>left</section><section>right<input name="name"/></section></main>',
        parserOptions,
      ),
    ).not.toThrow())

  it('should not throw on JSX with blank lines', () =>
    expect(() =>
      parser.parse('<header>\n\nTitle\n\n</header>', parserOptions),
    ).not.toThrow())

  it("should not throw on <$> or </$> because it's not considered as jsx", () => {
    expect(() => parser.parse('<$>', parserOptions)).not.toThrow()
    expect(() => parser.parse('</$>', parserOptions)).not.toThrow()
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

  it('should work with plain markdown file', () =>
    expect(() =>
      parser.parse('<img><br>', {
        ...parserOptions,
        filePath: 'test.md',
      }),
    ).not.toThrow())

  it('should work with multiple comments', () =>
    expect(() =>
      parser.parse('<!-- * foo -->\n<!-- * bar -->', {
        ...parserOptions,
        filePath: 'test.mdx',
      }),
    ).not.toThrow())
})
