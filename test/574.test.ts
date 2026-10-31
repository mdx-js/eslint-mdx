import { Linter } from 'eslint'

import * as mdx from 'eslint-plugin-mdx'

const linter = new Linter({ configType: 'flat' })

describe('#574', () => {
  it('treats props as defined in MDX content', () => {
    const messages = linter.verify(
      '### {props.foo}\n\n{props.foo} is a foo.\n',
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

    expect(messages).toEqual([])
  })

  it('exposes props in both config variants', () => {
    expect(mdx.configs.flat.languageOptions.globals).toMatchObject({
      props: false,
    })
    expect(mdx.configs.overrides.globals).toMatchObject({
      props: false,
    })
  })
})
