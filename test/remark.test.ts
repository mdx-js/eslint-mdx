import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

import type { Rule } from 'eslint'

import { ruleTester, languageOptions } from './helpers.js'

import { performSyncWork } from 'eslint-mdx'
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
  ],
})

test('hack', () => {
  // eslint-disable-next-line sonarjs/no-trivial-assertions -- placeholder to keep the suite non-empty
  expect(true).toBe(true)
})

describe('remark large document handling', () => {
  function getFixes(code: string, filename: string) {
    const fixes: Array<() => Rule.Fix[] | null> = []
    const visitor = remark.create({
      cwd: process.cwd(),
      filename,
      languageOptions: {
        parserOptions: {
          remarkConfigPath: path.resolve(
            import.meta.dirname,
            'remark-fixtures/large.remarkrc',
          ),
        },
      },
      parserOptions: {},
      report({ fix }: { fix?: () => Rule.Fix[] | null }) {
        if (fix) {
          fixes.push(fix)
        }
      },
      sourceCode: {
        getText: () => code,
      },
    } as never)

    const program = visitor.Program

    if (!program) {
      throw new Error('Expected a Program visitor')
    }

    program({
      type: 'Program',
    } as never)

    return fixes
  }

  it('skips fixes when the remark output expands the document', () => {
    const fixes = getFixes(
      `# A\n\n\n${TABLE_PADDING_MDX}`,
      path.resolve(import.meta.dirname, 'fixtures/-leading-dash.mdx'),
    )

    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes[0]()).toBeNull()
  })

  it('does not generate a no-op fix when output equals source', () => {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- just above threshold
    const source = `# A\n\n\`\`\`sh\n$ echo hi\n\`\`\`\n\n${'x'.repeat(65 * 1024)}`
    const code = performSyncWork({
      code: source,
      cwd: process.cwd(),
      filePath: path.resolve(import.meta.dirname, 'fixtures/style/large.mdx'),
      isMdx: true,
      process: true,
      remarkConfigPath: path.resolve(
        import.meta.dirname,
        'remark-fixtures/large.remarkrc',
      ),
    }).content
    const fixes = getFixes(
      code,
      path.resolve(import.meta.dirname, 'fixtures/style/large.mdx'),
    )

    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes[0]()).toBeNull()
  })

  it('uses the whole-document fallback once', () => {
    const unit = '* item one\n* item two\n\n'
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- above threshold
    const code = `# A\n\n\n${unit.repeat(5000)}`
    const fixes = getFixes(
      code,
      path.resolve(import.meta.dirname, 'fixtures/style/large.mdx'),
    )

    expect(fixes.length).toBeGreaterThan(0)
    const fix = fixes[0]()

    expect(fix).toHaveLength(1)
    expect(fix?.[0].range).toEqual([0, code.length])
    expect(typeof fix?.[0].text).toBe('string')
    expect(fix?.[0].text).not.toBe(code)
    expect(fixes[0]()).toBeNull()
  })
})
