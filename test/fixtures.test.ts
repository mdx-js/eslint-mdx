import { basename } from 'path'

import { ESLint } from 'eslint'

const cli = new ESLint({
  ignore: false,
  fix: true,
})

describe('fixtures', () => {
  it('should match all snapshots', async () => {
    const results = await cli.lintFiles(['test/fixtures/*.{md,mdx}'])
    return results.forEach(({ filePath, output, source }) =>
      expect(output || source).toMatchSnapshot(basename(filePath)),
    )
  })

  it('should parse many comments', async () => {
    const results = await cli.lintFiles(['test/fixtures/many-comments.mdx'])

    return results.forEach(({ errorCount }) => {
      expect(errorCount).toBe(0)
    })
  })
})
