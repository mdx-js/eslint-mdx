import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import type { Position } from 'acorn'
import type { Point } from 'unist'

import type { CjsRequire, NormalPosition } from './types.js'

export const arrayify = <T, R = T extends Array<infer S> ? S : T>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
    // eslint-disable-next-line sonarjs/no-nested-conditional
    arr.push(...(Array.isArray(curr) ? curr : curr == null ? [] : [curr]))
    return arr
  }, [])

/**
 * Given a filepath, get the nearest path that is a regular file. The filepath
 * provided by eslint may be a virtual filepath rather than a file on disk. This
 * attempts to transform a virtual path into an on-disk path
 */
export const getPhysicalFilename = (
  filename: string,
  child?: string,
): string => {
  try {
    if (fs.statSync(filename).isDirectory()) {
      return child || filename
    }
  } catch (err) {
    const { code } = err as { code: string }
    // https://github.com/eslint/eslint/issues/11989
    // Additionally, it seems there is no `ENOTDIR` code on Windows...
    // istanbul ignore if
    if (code === 'ENOTDIR' || code === 'ENOENT') {
      return getPhysicalFilename(path.dirname(filename), filename)
    }
  }
  return filename
}

/* istanbul ignore next -- used in worker */
export const getPositionAtFactory = (code: string) => {
  const lines = code.split('\n')
  return (offset: number): Position => {
    let currOffset = 0

    for (const [index, line_] of lines.entries()) {
      const line = index + 1
      const nextOffset = currOffset + line_.length

      if (nextOffset >= offset) {
        return {
          line,
          column: offset - currOffset,
        }
      }

      currOffset = nextOffset + 1 // add a line break `\n` offset
    }
  }
}

export const normalizePosition = ({
  start,
  end,
  code,
}: {
  start: Point | { offset: number }
  end: Point | { offset: number }
  code?: string
}): NormalPosition => {
  const startOffset = start.offset
  const endOffset = end.offset
  const range: [number, number] = [startOffset, endOffset]
  const getPositionAt =
    code == null
      ? null
      : /* istanbul ignore next -- used in worker */ getPositionAtFactory(code)
  return {
    start: startOffset,
    end: endOffset,
    loc: {
      start:
        /* istanbul ignore next -- used in worker */ 'line' in start
          ? (start as Position)
          : getPositionAt(startOffset),
      end:
        /* istanbul ignore next -- used in worker */ 'line' in end
          ? (end as Position)
          : getPositionAt(endOffset),
    },
    range,
  }
}

/* istanbul ignore next -- used in worker */
export const prevCharOffsetFactory =
  (code: string) =>
  (offset: number): number => {
    for (let i = offset; i >= 0; i--) {
      const char = code[i]
      if (/^\S$/.test(char)) {
        return i
      }
    }
  }

/* istanbul ignore next -- used in worker */
export const nextCharOffsetFactory = (text: string) => {
  const total = text.length
  return (offset: number): number => {
    for (let i = offset; i <= total; i++) {
      const char = text[i]
      if (/^\S$/.test(char)) {
        return i
      }
    }
  }
}

const importMetaUrl = import.meta.url

/* istanbul ignore next */
export const cjsRequire: CjsRequire = importMetaUrl
  ? createRequire(importMetaUrl)
  : require
