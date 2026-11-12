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
const remarkConfig = JSON.parse(fs.readFileSync(remarkConfigPath, 'utf8')) as {
  plugins: Array<string | [string, unknown]>
}

// `remark-lint-file-extension` is force-disabled by the worker when a config
// is present, so it can never be compared through these two paths.
const configRules = new Set(
  remarkConfig.plugins
    .map(plugin => (Array.isArray(plugin) ? plugin[0] : plugin))
    .filter(name => name.startsWith('remark-lint-'))
    .map(name => name.slice('remark-lint-'.length))
    .filter(name => name !== 'file-extension'),
)

// Keep the corpus and skip list adjacent: the skip list is specific to this
// corpus and should shrink as the remaining differences are fixed.
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

const allFixtureNames = fs
  .readdirSync(fixtureDir)
  .filter(file => /\.(?:md|mdx)$/u.test(file))
  .filter(file => fs.statSync(path.join(fixtureDir, file)).isFile())
  .sort((a, b) => a.localeCompare(b))

// Some rules still produce no messages on this corpus; an empty comparison is
// kept as an anti-false-positive guard until the corpus gains positive cases.
const fixtureNames = allFixtureNames.filter(file => {
  try {
    parser.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'), {
      ...DEFAULT_PARSER_OPTIONS,
      filePath: file,
      remarkConfigPath,
    })
    return true
  } catch {
    return false
  }
})

const skippedFixtureNames = allFixtureNames.filter(
  file => !fixtureNames.includes(file),
)

const ruleNames = Object.keys(rules).filter(
  name => configRules.has(name) && !knownDivergences.has(name),
)

const normalize = (
  messages: Array<{ column: number; line: number; message: string }>,
) => [...messages].sort((a, b) => a.line - b.line || a.column - b.column)

const getRemarkMessages = (file: string, code: string) => {
  const filePath = path.resolve(fixtureDir, file)

  return performSyncWork({
    filePath,
    code,
    cwd: process.cwd(),
    isMdx: file.endsWith('.mdx'),
    process: true,
    ignoreRemarkConfig: false,
    ignoreRemarkRules: new Set(),
    remarkConfigPath,
  }).messages.map(({ column, line, reason, ruleId }) => ({
    column,
    line,
    message: reason,
    ruleId,
  }))
}

const remarkMessages = new Map<string, ReturnType<typeof getRemarkMessages>>()

const getMismatches = (ruleName: string) => {
  const mismatches: Array<{
    file: string
    native: ReturnType<typeof normalize>
    remark: ReturnType<typeof normalize>
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

    const fatal = native.find(message => message.fatal)

    if (fatal) {
      throw new Error(`${file} failed to parse: ${fatal.message}`)
    }

    if (!remarkMessages.has(file)) {
      remarkMessages.set(file, getRemarkMessages(file, code))
    }

    const nativeMessages = normalize(
      native
        .filter(message => message.ruleId === `mdx/${ruleName}`)
        .map(({ column, line, message }) => ({
          column,
          line,
          message,
        })),
    )
    const remark = normalize(
      (remarkMessages.get(file) ?? [])
        .filter(message => message.ruleId === ruleName)
        .map(({ column, line, message }) => ({
          column,
          line,
          message,
        })),
    )

    if (JSON.stringify(nativeMessages) !== JSON.stringify(remark)) {
      mismatches.push({ file, native: nativeMessages, remark })
    }
  }

  return mismatches
}

test('only known unparseable fixtures are skipped', () => {
  expect(skippedFixtureNames).toEqual([
    '336.mdx',
    '576.mdx',
    'acorn.mdx',
    'comments.mdx',
    'details.mdx',
  ])
})

test('known divergences still diverge on this corpus', () => {
  expect.hasAssertions()

  for (const ruleName of knownDivergences) {
    expect(getMismatches(ruleName)).not.toEqual([])
  }
})

describe.each(ruleNames)('%s', ruleName => {
  test('matches remark-lint on the shared corpus', () => {
    expect.hasAssertions()
    expect(getMismatches(ruleName)).toEqual([])
  })
})
