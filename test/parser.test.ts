/* eslint-disable sonarjs/no-duplicate-string */
import { noop } from './helpers'

import type { ParserConfig, ParserOptions } from 'eslint-mdx'
import { normalizeParser, parser, parsersCache } from 'eslint-mdx'

const JS_TEST_FILE = 'test.js'

describe('parser', () => {
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
    for (const p of parserConfigs) {
      expect(() =>
        parser.parse('let a = 1', {
          parser: p,
          filePath: JS_TEST_FILE,
        }),
      ).toThrowErrorMatchingSnapshot()
    }

    expect(() =>
      parser.parse('let a = 1', {
        parser: noop as ParserOptions['parser'],
        filePath: JS_TEST_FILE,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot use 'in' operator to search for 'ast' in undefined"`,
    )
  })

  it('should work with valid custom parser', () => {
    expect(() =>
      parser.parse('let a = 1', {
        parser: '@babel/eslint-parser',
        filePath: JS_TEST_FILE,
        babelOptions: {
          configFile: require.resolve('@1stg/babel-preset/config'),
        },
      }),
    ).not.toThrow()
  })

  it('should fallback to espree if no preferred parsers found', () => {
    const mockErrorParser = () => {
      throw new Error('parse error')
    }
    const errorParser = { parse: mockErrorParser }
    jest
      .setMock('@typescript-eslint/parser', null)
      .setMock('@babel/eslint-parser', null)
      .mock('babel-eslint', noop, { virtual: true })
      .setMock('espree', errorParser)
    expect(normalizeParser()).toEqual([mockErrorParser])
    parsersCache.clear()
    jest.setMock('@babel/eslint-parser', errorParser)
    expect(() =>
      parser.parse('', {
        filePath: JS_TEST_FILE,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`"parse error"`)
    jest
      .dontMock('@typescript-eslint/parser')
      .dontMock('@babel/eslint-parser')
      .dontMock('babel-eslint')
      .dontMock('espree')
    parsersCache.clear()
  })

  it('should throw on invalid es syntaxes', () => {
    expect(() =>
      parser.parse("import A from 'a'\nimport A from 'a'"),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not parse import/exports with acorn: SyntaxError: Identifier 'A' has already been declared"`,
    )
    expect(() =>
      parser.parse('<header><>\n</header>'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected closing tag \`</header>\`, expected corresponding closing tag for \`<>\` (1:9-1:11)"`,
    )
    expect(() => parser.parse('<h1></h2>')).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected closing tag \`</h2>\`, expected corresponding closing tag for \`<h1>\` (1:1-1:5)"`,
    )
    expect(() =>
      parser.parse('Header\n<>', {
        parser: '@typescript-eslint/parser',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected a closing tag for \`<>\` (2:1-2:3)"`,
    )
    expect(() =>
      parser.parse('Header\n<>', {
        parser: '@babel/eslint-parser',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Expected a closing tag for \`<>\` (2:1-2:3)"`,
    )
    expect(() =>
      parser.parse('<main><</main>'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected character \`<\` (U+003C) before name, expected a character that can start a name, such as a letter, \`$\`, or \`_\`"`,
    )
    expect(() =>
      parser.parse('<main>{<}</main>'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not parse expression with acorn: Unexpected token"`,
    )
    expect(() =>
      parser.parse('<main>\n<section><</section></main>'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected character \`<\` (U+003C) before name, expected a character that can start a name, such as a letter, \`$\`, or \`_\`"`,
    )
  })

  it('should not throw on adjacent JSX nodes', () =>
    expect(() =>
      parser.parse(
        '<header></header>\n<main><section>left</section><section>right<input name="name"/></section></main>',
      ),
    ).not.toThrow())

  it('should not throw on JSX with blank lines', () =>
    expect(() => parser.parse('<header>\n\nTitle\n\n</header>')).not.toThrow())

  it('should be able to parse normal js file', () => {
    expect(() =>
      parser.parse("import A from 'a'", {
        filePath: JS_TEST_FILE,
      }),
    ).not.toThrow()
    expect(() =>
      parser.parse('const a = {}', {
        filePath: JS_TEST_FILE,
      }),
    ).not.toThrow()
  })

  it('should work with plain markdown file', () =>
    expect(() =>
      parser.parse('<img><br>', {
        filePath: 'test.md',
      }),
    ).not.toThrow())
})
