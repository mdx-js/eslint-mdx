import { normalizeJsxNode, mdxProcessor } from '../src'

import { Parent } from 'unist'

describe('normalizer', () => {
  it('should transform html style comment in jsx into jsx comment', () => {
    const sourceText = `<Comment><!-- JSX Comment --><!-- JSX Comment --></Comment>`
    const expectText = `<Comment>{/** JSX Comment */}{/** JSX Comment */}</Comment>`
    expect(
      normalizeJsxNode((mdxProcessor.parse(sourceText) as Parent).children[0])
        .value,
    ).toBe(expectText)
  })
})
