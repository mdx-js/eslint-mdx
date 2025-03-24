import fs from 'node:fs/promises'
import path from 'node:path'

import { Linter } from 'eslint'

import * as mdx from 'eslint-plugin-mdx'

const linter = new Linter({ configType: 'flat' })

const _dirname = import.meta.dirname

describe('flat-config', () => {
  it('should work as expected', async () => {
    const dirname = path.resolve(_dirname, 'fixtures/flat-config')
    const files = await fs.readdir(dirname)
    for (const file of files) {
      expect(
        linter.verify(
          await fs.readFile(path.resolve(dirname, file), 'utf8'),
          [
            {
              ...mdx.flat,
              processor: mdx.createRemarkProcessor({
                lintCodeBlocks: true,
              }),
            },
            {
              ...mdx.flatCodeBlocks,
              rules: {
                ...mdx.flatCodeBlocks.rules,
                'no-var': 'error',
                'prefer-const': 'error',
              },
            },
          ],
          file,
        ),
      ).toMatchSnapshot(file)
    }
  })
})
