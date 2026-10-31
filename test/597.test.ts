import { Linter, type Rule } from 'eslint'

import { parser } from 'eslint-mdx'

const removeImportRule: Rule.RuleModule = {
  meta: {
    fixable: 'code',
    type: 'problem',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const nextToken = context.sourceCode.getTokenAfter(node)

        if (!nextToken) {
          return
        }

        context.report({
          fix: fixer => fixer.removeRange([node.range![0], nextToken.range[0]]),
          message: 'remove unused import',
          node,
        })
      },
    }
  },
}

const linter = new Linter({ configType: 'flat' })

describe('#597', () => {
  it('keeps a heading after removing an unused import', () => {
    const result = linter.verifyAndFix(
      "import React from 'react';\n\n# Hello World\n",
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
        },
        plugins: {
          test: {
            rules: {
              'remove-import': removeImportRule,
            },
          },
        },
        rules: {
          'test/remove-import': 'error',
        },
      },
      { filename: 'test.mdx' },
    )

    expect(result.output).toBe('# Hello World\n')
  })
})
