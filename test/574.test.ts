import { Linter } from 'eslint'
import react from 'eslint-plugin-react'

import { parser } from 'eslint-mdx'
import * as mdx from 'eslint-plugin-mdx'

const linter = new Linter({ configType: 'flat' })

describe('#574', () => {
  it('keeps scopeManager.acquire safe for detached JSX identifiers', () => {
    const { scopeManager } = parser.parseForESLint('<props.Component />\n', {
      ecmaFeatures: { jsx: true },
      filePath: 'test.mdx',
      sourceType: 'module',
    })
    const detached = {
      name: 'props',
      range: [0, 5] as [number, number],
      type: 'JSXIdentifier',
    }

    if (!scopeManager) {
      throw new Error('Expected a scope manager')
    }

    const manager = scopeManager

    expect(() =>
      manager.acquire(detached as Parameters<typeof manager.acquire>[0], true),
    ).not.toThrow()
  })

  it('treats props as defined in MDX content', () => {
    const messages = linter.verify(
      '### {props.foo}\n\n{props.foo} is a foo.\n\n<><props.Component /><props.Other /></>\n',
      [
        mdx.configs.flat,
        {
          plugins: {
            react,
          },
          rules: {
            'no-undef': 'error',
            'react/jsx-no-undef': 'error',
          },
        },
      ],
      { filename: 'test.mdx' },
    )

    expect(messages).toEqual([])
  })

  it('does not treat props as defined in JSX inside MDX ESM', () => {
    const messages = linter.verify(
      'export const foo = <props.Component />\n',
      [
        mdx.configs.flat,
        {
          plugins: {
            react,
          },
          rules: {
            'no-undef': 'error',
            'react/jsx-no-undef': 'error',
          },
        },
      ],
      { filename: 'test.mdx' },
    )

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: 'no-undef',
        }),
        expect.objectContaining({
          ruleId: 'react/jsx-no-undef',
        }),
      ]),
    )
  })

  it('keeps local components visible in nested MDX scopes', () => {
    const messages = linter.verify(
      [
        '{(() => { const Foo = () => null; return <Foo /> })()}',
        '{(() => { const Bar = () => null; return <Bar /> })()}',
        '{(() => { const A = () => null; return () => { const B = () => null; return <B /> } })()}',
        '',
      ].join('\n'),
      [
        mdx.configs.flat,
        {
          plugins: {
            react,
          },
          rules: {
            'no-undef': 'error',
            'react/jsx-no-undef': 'error',
          },
        },
      ],
      { filename: 'test.mdx' },
    )

    expect(messages).toEqual([])
  })

  it('does not treat props as defined in MDX ESM', () => {
    const messages = linter.verify(
      'export const foo = props.bar\n',
      [
        mdx.configs.flat,
        {
          rules: {
            'no-undef': 'error',
          },
        },
      ],
      { filename: 'test.mdx' },
    )

    expect(messages).toEqual([
      expect.objectContaining({
        message: "'props' is not defined.",
        ruleId: 'no-undef',
      }),
    ])
  })
})
