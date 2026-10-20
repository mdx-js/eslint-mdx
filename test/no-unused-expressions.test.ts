import type { Rule } from 'eslint'
import type { ExpressionStatement } from 'estree'

import { noUnusedExpressions } from 'eslint-plugin-mdx'

interface MockContextOptions {
  filename?: string
  getFilename?: () => string
  languageOptions?: {
    parserOptions?: Record<string, unknown>
  }
  options?: unknown[]
  parserOptions?: Record<string, unknown>
}

const createContext = (options: MockContextOptions = {}) => {
  const reports: unknown[] = []
  return {
    context: {
      filename: options.filename,
      getFilename: options.getFilename,
      languageOptions: options.languageOptions,
      options: options.options || [],
      parserOptions: options.parserOptions,
      report: (descriptor: unknown) => {
        reports.push(descriptor)
      },
    } as unknown as Rule.RuleContext,
    reports,
  }
}

const createExpressionStatement = (
  parentType: 'BlockStatement' | 'Program',
): ExpressionStatement => {
  const node = {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      raw: '1',
      value: 1,
    },
    parent: {
      type: parentType,
      body: [],
    },
  } as unknown as ExpressionStatement & {
    parent: { body: ExpressionStatement[] }
  }
  node.parent.body.push(node)
  return node
}

const runExpressionStatement = (
  context: Rule.RuleContext,
  node: ExpressionStatement,
) => {
  const visitors = noUnusedExpressions.create(context)
  const listener = visitors.ExpressionStatement
  listener(node as Parameters<typeof listener>[0])
}

describe('no-unused-expressions', () => {
  it.each<[string, MockContextOptions]>([
    ['MDX', { filename: 'test.mdx' }],
    ['markdown', { filename: 'test.md' }],
    ['legacy getFilename', { getFilename: () => 'test.mdx' }],
    [
      'custom extensions from legacy parserOptions',
      { filename: 'test.custom', parserOptions: { extensions: ['.custom'] } },
    ],
    [
      'markdownExtensions as a string',
      {
        filename: 'test.mdx2',
        languageOptions: {
          parserOptions: { markdownExtensions: '.mdx2' },
        },
      },
    ],
  ])('ignores top-level expressions in %s', (_name, options) => {
    const { context, reports } = createContext(options)
    runExpressionStatement(context, createExpressionStatement('Program'))
    expect(reports).toHaveLength(0)
  })

  it('reports unused JavaScript expressions', () => {
    const { context, reports } = createContext({ filename: 'test.js' })
    runExpressionStatement(context, createExpressionStatement('Program'))
    expect(reports).toHaveLength(1)
  })

  it('reports unused expressions nested in MDX', () => {
    const { context, reports } = createContext({ filename: 'test.mdx' })
    runExpressionStatement(context, createExpressionStatement('BlockStatement'))
    expect(reports).toHaveLength(1)
  })

  it('passes options to the core rule', () => {
    const { context, reports } = createContext({
      filename: 'test.js',
      options: [{}],
    })
    runExpressionStatement(context, createExpressionStatement('Program'))
    expect(reports).toHaveLength(1)
  })
})
