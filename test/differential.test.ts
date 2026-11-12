import fs from 'node:fs'
import path from 'node:path'

import { Linter } from 'eslint'

import { DEFAULT_PARSER_OPTIONS } from './helpers.js'

import { parser, performSyncWork } from 'eslint-mdx'
import { rules } from 'eslint-plugin-mdx'

const linter = new Linter({ configType: 'flat' })
const _dirname = import.meta.dirname
const fixtureDir = path.resolve(_dirname, 'fixtures')
const remarkConfigPath = path.resolve(_dirname, 'remark-fixtures/next.remarkrc')

const fixtureNames = [
  '287.mdx',
  '292.mdx',
  '367.mdx',
  '380.mdx',
  '435.mdx',
  '581.mdx',
  'basic.mdx',
  'blank-lines.mdx',
  'jsx-in-list.mdx',
  'markdown.md',
  'nested-empty-expression.mdx',
  'remark.md',
]

// These rules still have known message/location differences on the shared
// corpus. They should move out of this list as the differential audit is fixed.
const knownDivergences = new Set([
  'list-item-bullet-indent',
  'list-item-indent',
  'list-item-spacing',
  'maximum-heading-length',
  'maximum-line-length',
  'no-literal-urls',
  'ordered-list-marker-style',
  'table-pipe-alignment',
])

const ruleNames = Object.keys(rules).filter(
  name => name !== 'remark' && !knownDivergences.has(name),
)

const normalizeNative = (messages: Linter.LintMessage[]) =>
  messages
    .filter(message => !message.fatal)
    .map(({ column, line, message }) => ({ column, line, message }))
    .sort((a, b) => a.line - b.line || a.column - b.column)

const normalizeRemark = (
  messages: Array<{ column: number; line: number; reason: string }>,
) =>
  messages
    .map(({ column, line, reason }) => ({ column, line, message: reason }))
    .sort((a, b) => a.line - b.line || a.column - b.column)

const getMismatches = (ruleName: string) => {
  const mismatches: Array<{
    file: string
    native: ReturnType<typeof normalizeNative>
    remark: ReturnType<typeof normalizeRemark>
  }> = []

  for (const file of fixtureNames) {
    const filePath = path.resolve(fixtureDir, file)
    const code = fs.readFileSync(filePath, 'utf8')
    const native = linter.verify(
      code,
      [
        {
          files: ['**/*.{md,mdx}'],
          languageOptions: {
            parser,
            parserOptions: {
              ...DEFAULT_PARSER_OPTIONS,
              remarkConfigPath,
            },
          },
          plugins: { mdx: { rules } },
          rules: { [`mdx/${ruleName}`]: 'warn' },
        },
      ],
      { filename: filePath },
    )

    if (native.some(message => message.fatal)) {
      continue
    }

    const remark = performSyncWork({
      filePath,
      code,
      cwd: process.cwd(),
      isMdx: file.endsWith('.mdx'),
      process: true,
      ignoreRemarkConfig: false,
      ignoreRemarkRules: new Set(),
      remarkConfigPath,
    }).messages.filter(message => message.ruleId === ruleName)

    const nativeMessages = normalizeNative(
      native.filter(message => message.ruleId === `mdx/${ruleName}`),
    )
    const remarkMessages = normalizeRemark(remark)

    if (JSON.stringify(nativeMessages) !== JSON.stringify(remarkMessages)) {
      mismatches.push({
        file,
        native: nativeMessages,
        remark: remarkMessages,
      })
    }
  }

  return mismatches
}

describe.each(ruleNames)('%s', ruleName => {
  test('matches remark-lint on the shared corpus', () => {
    expect.hasAssertions()
    expect(getMismatches(ruleName)).toEqual([])
  })
})
