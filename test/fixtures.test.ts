import path from 'path'

import { ESLint } from 'eslint'

const cli = new ESLint({
  ignore: false,
  fix: true,
})

describe('fixtures', () => {
  it('should match all snapshots', async () => {
    const results = await cli.lintFiles(['test/fixtures/*.{md,mdx}'])
    for (const { filePath, output, source } of results) {
      expect(output || source).toMatchSnapshot(path.basename(filePath))
    }
  })
})
