import type { Rule } from 'eslint'
import type { MDTable } from 'eslint-mdx'

import { getRuleConfig } from './helpers.js'

declare module 'eslint-mdx' {
  interface RemarkRuleOptions {
    'table-pipe-alignment': never
  }
}

type Align = 'center' | 'left' | 'right' | null

interface Size {
  left?: number
  leftOffset: number
  middle: number
  right?: number
  rightOffset: number
}

interface Entry {
  align: Align
  column: number
  contentStart?: number
  row?: number
  size?: Size
}

const PIPE = 124
const SPACE = 32
const CARRIAGE_RETURN = 13
const LINE_FEED = 10
const TAB = 9
const GREATER_THAN = 62
const HYPHEN = 45
const COLON = 58

const pluralize = (count: number) => (count === 1 ? 'space' : 'spaces')

export const tablePipeAlignment: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce table pipe alignment' },
    schema: [],
  },
  create(context) {
    const config = getRuleConfig(context, 'table-pipe-alignment')

    if (!config) {
      return {}
    }

    const sourceText = context.sourceCode.getText()

    const inferSize = (
      startOffset: number,
      endOffset: number,
      tailCell: boolean,
    ): Size | undefined => {
      let leftIndex = startOffset
      let left: number | undefined

      if (sourceText.codePointAt(leftIndex) === PIPE) {
        left = 0
        leftIndex++

        while (sourceText.codePointAt(leftIndex) === SPACE) {
          left++
          leftIndex++
        }
      }

      let rightIndex = endOffset
      let right: number | undefined

      if (tailCell) {
        while (sourceText.codePointAt(rightIndex - 1) === SPACE) {
          rightIndex--
        }

        if (
          rightIndex > leftIndex &&
          sourceText.codePointAt(rightIndex - 1) === PIPE
        ) {
          rightIndex--
        } else {
          rightIndex = endOffset
        }
      }

      const rightEdgeIndex = rightIndex

      if (sourceText.codePointAt(rightIndex) === PIPE) {
        right = 0

        while (
          rightIndex - 1 > leftIndex &&
          sourceText.codePointAt(rightIndex - 1) === SPACE
        ) {
          right++
          rightIndex--
        }
      }

      return {
        left,
        leftOffset: leftIndex,
        middle: rightIndex - leftIndex,
        right,
        rightOffset: rightEdgeIndex,
      }
    }

    /* eslint-disable-next-line sonarjs/cognitive-complexity -- ported algorithm */
    const inferAlignRow = (table: MDTable): Entry[] | undefined => {
      const header = table.children[0]

      /* istanbul ignore if -- tables always have a header row */
      if (!header) {
        return
      }

      let index = header.range[1]

      if (sourceText.codePointAt(index) === CARRIAGE_RETURN) {
        index++
      }

      /* istanbul ignore if -- a table always has an alignment row */
      if (sourceText.codePointAt(index) !== LINE_FEED) {
        return
      }

      index++

      let code = sourceText.codePointAt(index)

      while (code === TAB || code === SPACE || code === GREATER_THAN) {
        index++
        code = sourceText.codePointAt(index)
      }

      /* istanbul ignore if -- the parser only produces table alignment rows */
      if (code !== HYPHEN && code !== COLON && code !== PIPE) {
        return
      }

      let lineEndOffset = sourceText.indexOf('\n', index)

      if (lineEndOffset === -1) {
        lineEndOffset = sourceText.length
      }

      if (sourceText.codePointAt(lineEndOffset - 1) === CARRIAGE_RETURN) {
        lineEndOffset--
      }

      let column = 0
      let cellStart = index
      let cellEnd = sourceText.indexOf('|', index + (code === PIPE ? 1 : 0))

      /* istanbul ignore if -- alignment rows always contain a pipe or dashes */
      if (cellEnd === -1 || cellEnd > lineEndOffset) {
        cellEnd = lineEndOffset
      }

      const entries: Entry[] = []

      while (cellStart !== cellEnd) {
        let nextCellEnd = sourceText.indexOf('|', cellEnd + 1)

        if (nextCellEnd === -1 || nextCellEnd > lineEndOffset) {
          nextCellEnd = lineEndOffset
        }

        if (nextCellEnd === lineEndOffset) {
          let maybeEnd = lineEndOffset
          let trail = sourceText.codePointAt(maybeEnd - 1)

          while (trail === TAB || trail === SPACE) {
            maybeEnd--
            trail = sourceText.codePointAt(maybeEnd - 1)
          }

          if (cellEnd + 1 === maybeEnd) {
            cellEnd = lineEndOffset
          }
        }

        entries.push({
          align: table.align?.[column] ?? null,
          column,
          contentStart: index,
          size: inferSize(cellStart, cellEnd, cellEnd === lineEndOffset),
        })

        cellStart = cellEnd
        cellEnd = nextCellEnd
        column++
      }

      return entries
    }

    const inferTable = (table: MDTable): Entry[] => {
      const entries: Entry[] = []

      for (const [row, rowNode] of table.children.entries()) {
        for (const [column, cell] of rowNode.children.entries()) {
          entries.push({
            align: table.align?.[column] ?? null,
            column,
            row,
            size: inferSize(
              cell.range[0],
              cell.range[1],
              column === rowNode.children.length - 1,
            ),
          })
        }

        if (row === 0) {
          /* istanbul ignore next -- tables always have an alignment row */
          entries.push(...(inferAlignRow(table) ?? []))
        }
      }

      return entries
    }

    return {
      /* eslint-disable-next-line sonarjs/cognitive-complexity -- ported algorithm */
      MDTable(table: MDTable) {
        const entries = inferTable(table)
        const sizes: number[] = []

        for (const entry of entries) {
          /* istanbul ignore if -- table cells always have a size */
          if (entry.size == null) {
            continue
          }

          const total =
            entry.size.middle + (entry.size.left ?? 0) + (entry.size.right ?? 0)

          if (
            sizes[entry.column] === undefined ||
            total > sizes[entry.column]
          ) {
            sizes[entry.column] = total
          }
        }

        const warn = (entry: Entry, add: number, offset: number) => {
          if (add === 0) {
            return
          }

          const absolute = context.sourceCode.getLocFromIndex(offset)
          const position =
            entry.contentStart === undefined
              ? absolute
              : {
                  line: absolute.line,
                  column: offset - entry.contentStart,
                }

          context.report({
            loc: { start: position, end: position },
            message: `Unexpected unaligned cell, expected aligned pipes, add \`${add}\` ${pluralize(add)}${entry.row === undefined ? ' (or add `-` to pad alignment row cells)' : ''}`,
          })
        }

        for (const entry of entries) {
          /* istanbul ignore if -- table cells always have a size */
          if (entry.size == null) {
            continue
          }

          const total =
            entry.size.middle + (entry.size.left ?? 0) + (entry.size.right ?? 0)
          const difference = sizes[entry.column] - total
          let left = 0
          let right = 0

          if (entry.align === 'center' && entry.size.middle && difference > 0) {
            const max = Math.floor(
              (sizes[entry.column] - entry.size.middle) / 2,
            )

            if (entry.size.right !== undefined && max > entry.size.right) {
              right = max - entry.size.right
            }

            left = difference - right
          } else if (entry.align === 'right') {
            left = difference
          } else {
            right = difference
          }

          warn(entry, left, entry.size.leftOffset)

          if (entry.size.right !== undefined) {
            warn(entry, right, entry.size.rightOffset)
          }
        }
      },
    }
  },
}
