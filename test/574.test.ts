import { Linter } from 'eslint'
import react from 'eslint-plugin-react'

import * as mdx from 'eslint-plugin-mdx'

const linter = new Linter({ configType: 'flat' })

describe('#574', () => {
  it('treats props as defined in MDX content', () => {
    const messages = linter.verify(
      '### {props.foo}\n\n{props.foo} is a foo.\n\n<props.Component />\n',
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
