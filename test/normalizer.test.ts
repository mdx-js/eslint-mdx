import { normalizeMdx } from '../src'

describe('normalizer', () => {
  it('should transform html style comment in jsx into jsx comment', () => {
    const sourceText = `---
name
---

<Comment><!-- JSX Comment --><!-- JSX Comment --></Comment>
`

    const expectText = `---
name
---

<Comment>{/* JSX Comment */}{/* JSX Comment */}</Comment>
`

    expect(normalizeMdx(sourceText)).toBe(expectText)
  })
})
