import { DEFAULT_PARSER_OPTIONS } from './helpers'

import { parser } from 'eslint-mdx'

describe('parser', () => {
  it('should throw on incorrect extension', () => {
    expect(() =>
      parser.parse("import A from 'a'\n", {
        ...DEFAULT_PARSER_OPTIONS,
        filePath: '__placeholder__.js',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unsupported file extension, make sure setting the \`extensions\` or \`markdownExtensions\` option correctly."`,
    )
  })

  it('should throw on invalid es syntaxes', () => {
    expect(() =>
      parser.parse(
        "import A from 'a'\nimport A from 'a'",
        DEFAULT_PARSER_OPTIONS,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not parse import/exports with acorn: SyntaxError: Identifier 'A' has already been declared"`,
    )
    expect(() =>
      parser.parse('<header><>\n</header>', DEFAULT_PARSER_OPTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected closing tag \`</header>\`, expected corresponding closing tag for \`<>\` (1:9-1:11)"`,
    )
    expect(() =>
      parser.parse('<h1></h2>', DEFAULT_PARSER_OPTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected closing tag \`</h2>\`, expected corresponding closing tag for \`<h1>\` (1:1-1:5)"`,
    )
    expect(() =>
      parser.parse('Header\n<>', {
        parser: '@typescript-eslint/parser',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The \\"path\\" argument must be of type string. Received undefined"`,
    )
    expect(() =>
      parser.parse('Header\n<>', {
        parser: '@babel/eslint-parser',
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The \\"path\\" argument must be of type string. Received undefined"`,
    )
    expect(() =>
      parser.parse('<main><</main>', DEFAULT_PARSER_OPTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected character \`<\` (U+003C) before name, expected a character that can start a name, such as a letter, \`$\`, or \`_\`"`,
    )
    expect(() =>
      parser.parse('<main>{<}</main>', DEFAULT_PARSER_OPTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not parse expression with acorn: Unexpected token"`,
    )
    expect(() =>
      parser.parse(
        '<main>\n<section><</section></main>',
        DEFAULT_PARSER_OPTIONS,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected character \`<\` (U+003C) before name, expected a character that can start a name, such as a letter, \`$\`, or \`_\`"`,
    )
  })

  it('should not throw on adjacent JSX nodes', () =>
    expect(() =>
      parser.parse(
        '<header></header>\n<main><section>left</section><section>right<input name="name"/></section></main>',
        DEFAULT_PARSER_OPTIONS,
      ),
    ).not.toThrow())

  it('should not throw on JSX with blank lines', () =>
    expect(() =>
      parser.parse('<header>\n\nTitle\n\n</header>', DEFAULT_PARSER_OPTIONS),
    ).not.toThrow())

  it('should work with plain markdown file', () =>
    expect(() =>
      parser.parse('<img><br>', {
        filePath: 'test.md',
      }),
    ).not.toThrow())

  it('should parse jsx spread correctly', () =>
    expect(
      parser.parse('<div {...{}}></div>', {
        filePath: 'test.mdx',
      }),
    ).toMatchSnapshot())
})
