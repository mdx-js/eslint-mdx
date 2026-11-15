import { Linter } from 'eslint'

import { parser } from 'eslint-mdx'

const linter = new Linter({ configType: 'flat' })

describe('#695', () => {
  it('reports 0-based columns for Program, JSX statements and MDX expressions', () => {
    const messages = linter.verify(
      '# Title\n\n<Foo />\n\n{1 + 1}\n',
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
        },
        rules: {
          'no-restricted-syntax': [
            'error',
            'Program',
            'JSXElement',
            'ExpressionStatement',
            'MDXFlowExpression',
          ],
        },
      },
      { filename: 'a.mdx' },
    )

    expect(
      messages.map(
        ({ line, column, endLine, endColumn, message }) =>
          `${line}:${column}-${endLine}:${endColumn} ${message}`,
      ),
    ).toEqual([
      "1:1-6:1 Using 'Program' is not allowed.",
      "3:1-3:8 Using 'ExpressionStatement' is not allowed.",
      "3:1-3:8 Using 'JSXElement' is not allowed.",
      "5:1-5:8 Using 'MDXFlowExpression' is not allowed.",
    ])
  })
})
