import { basename } from 'path'

import { CLIEngine } from 'eslint'

const cli = new CLIEngine({
  ignore: false,
  fix: true,
})

describe('fixtures', () => {
  it('should match all snapshots', () => {
    cli
      .executeOnFiles(['test/fixtures/*.{md,mdx}'])
      .results.forEach(({ filePath, output, source }) =>
        expect(output || source).toMatchSnapshot(basename(filePath)),
      )
  })
})
