import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

import { Linter } from 'eslint'

import { ruleTester, languageOptions, parser } from './helpers.js'

import { remark } from 'eslint-plugin-mdx'

const userDir = homedir()

// One long table cell makes remark-gfm pad every short row to its width.
// The transformed document becomes large enough that diffing is unsafe.
const TABLE_PADDING_MDX = readFileSync(
  new URL('remark-fixtures/table-padding.mdx', import.meta.url),
  'utf8',
)

const _dirname = import.meta.dirname
const _filename = import.meta.filename

ruleTester.run('remark', remark, {
  valid: [
    {
      code: '<header>Header1</header>',
      languageOptions,
      filename: 'remark.mdx',
    },
    {
      code: '<header>Header2</header>',
      languageOptions,
      filename: path.resolve(_filename, '0-fake.mdx'),
    },
    {
      code: '<header>Header3</header>',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/dir.mdx'),
    },
    {
      code: '<header>Header4</header>',
      languageOptions,
      filename: path.resolve(userDir, '../test.mdx'),
    },
    {
      code: '<header>Header5</header>',
      languageOptions,
      filename: path.resolve(userDir, '../test.md'),
    },
    {
      code: '<header>Header6</header>',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/async/test.mdx'),
    },
    {
      code: '_emphasis_ and __strong__',
      languageOptions: {
        ...languageOptions,
        parserOptions: {
          ...languageOptions.parserOptions,
          ignoreRemarkConfig: true,
        },
      },
      filename: path.resolve(_dirname, 'fixtures/style/test.mdx'),
    },
  ],
  invalid: [
    {
      // file-level remark reports have no place, they must be reported as-is
      code: '# Title',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/-leading-dash.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason:
              'Unexpected initial or final dashes in file name, expected dashes to join words',
            source: 'remark-lint',
            ruleId: 'no-file-name-outer-dashes',
            severity: 1,
          }),
          line: 1,
          column: 1,
        },
      ],
    },
    {
      // remark-gfm table padding can expand the output enough that diffing is unsafe
      code: TABLE_PADDING_MDX,
      filename: path.resolve(_dirname, 'fixtures/-leading-dash.mdx'),
      languageOptions,
      errors: [
        {
          message: JSON.stringify({
            reason:
              'Unexpected initial or final dashes in file name, expected dashes to join words',
            source: 'remark-lint',
            ruleId: 'no-file-name-outer-dashes',
            severity: 1,
          }),
          line: 1,
          column: 1,
        },
      ],
      output: null,
    },
    {
      // https://github.com/syntax-tree/mdast-util-to-markdown/issues/29
      code: '[CHANGELOG](./CHANGELOG.md)',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/async/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Cannot find file `CHANGELOG.md`',
            source: 'remark-validate-links:missing-file',
            ruleId: 'missing-file',
            severity: 1,
          }),
          line: 1,
          column: 1,
        },
      ],
      output: '[CHANGELOG](./CHANGELOG.md)\n',
    },
    {
      // https://github.com/syntax-tree/mdast-util-to-markdown/issues/29
      code: '[CHANGELOG](./CHANGELOG.md)\n',
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/async/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Cannot find file `CHANGELOG.md`',
            source: 'remark-validate-links:missing-file',
            ruleId: 'missing-file',
            severity: 1,
          }),
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 28,
        },
      ],
    },
    {
      code: `_emphasis_ and __strong__`,
      languageOptions,
      filename: path.resolve(_dirname, 'fixtures/style/test.mdx'),
      errors: [
        {
          message: JSON.stringify({
            reason: 'Unexpected emphasis marker `_`, expected `*`',
            source: 'remark-lint',
            ruleId: 'emphasis-marker',
            severity: 1,
          }),
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 11,
        },
        {
          message: JSON.stringify({
            reason: 'Unexpected strong marker `_`, expected `*`',
            source: 'remark-lint',
            ruleId: 'strong-marker',
            severity: 1,
          }),
          line: 1,
          column: 16,
          endLine: 1,
          endColumn: 26,
        },
      ],
      output: '*emphasis* and **strong**\n',
    },
  ],
})

test('hack', () => {
  // eslint-disable-next-line sonarjs/no-trivial-assertions -- placeholder to keep the suite non-empty
  expect(true).toBe(true)
})

describe('remark large document handling', () => {
  it('skips fixes when the remark output expands the document', () => {
    const linter = new Linter()
    const filename = path.resolve(
      import.meta.dirname,
      'fixtures/-leading-dash.mdx',
    )
    const config = [
      {
        files: ['**/*.mdx'],
        languageOptions: {
          ...languageOptions,
          parserOptions: {
            ...languageOptions.parserOptions,
            remarkConfigPath: path.resolve(
              import.meta.dirname,
              'remark-fixtures/large.remarkrc',
            ),
          },
        },
        plugins: { mdx: { rules: { remark } } },
        rules: { 'mdx/remark': 'warn' },
      },
    ] as Linter.Config[]

    expect(
      linter.verify(`# A\n\n### B\n\n${TABLE_PADDING_MDX}`, config, {
        filename,
      }).length,
    ).toBeGreaterThan(0)
    expect(
      linter.verifyAndFix(`# A\n\n### B\n\n${TABLE_PADDING_MDX}`, config, {
        filename,
      }).fixed,
    ).toBe(false)
  })

  it('uses the whole-document fallback and reports remaining messages', () => {
    const linter = new Linter()
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- just above threshold
    const code = `# Title\n\n${'x'.repeat(65 * 1024)}\n\n_emphasis_\n\n_emphasis_\n`
    const config = [
      {
        files: ['**/*.mdx'],
        languageOptions: {
          parser,
          parserOptions: {
            remarkConfigPath: path.resolve(
              import.meta.dirname,
              'fixtures/style/.remarkrc',
            ),
          },
        },
        plugins: { mdx: { rules: { remark } } },
        rules: { 'mdx/remark': 'warn' },
      },
    ] as Linter.Config[]
    const filename = path.resolve(
      import.meta.dirname,
      'fixtures/style/large.mdx',
    )

    expect(linter.verify(code, config, { filename }).length).toBeGreaterThan(0)
    expect(linter.verifyAndFix(code, config, { filename }).fixed).toBe(true)
  })
})
