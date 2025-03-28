import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import type { Position } from 'acorn'
import type { Point } from 'unist'

import type { CjsRequire, NormalPosition } from './types.js'

export const last = <T>(items: T[] | readonly T[]) =>
  // eslint-disable-next-line unicorn/prefer-at -- FIXME: Node 16.6+ required
  items && items[items.length - 1]

export const arrayify = <T, R = T extends Array<infer S> ? S : T>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
    // eslint-disable-next-line sonarjs/no-nested-conditional
    arr.push(...(Array.isArray(curr) ? curr : curr == null ? [] : [curr]))
    return arr
  }, [])

/**
 * Given a filepath, get the nearest path that is a regular file.
 * The filepath provided by eslint may be a virtual filepath rather than a file
 * on disk. This attempts to transform a virtual path into an on-disk path
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

/**
 * ! copied from https://github.com/just-jeb/angular-builders/blob/master/packages/custom-webpack/src/utils.ts#L53-L67
 *
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
/* istanbul ignore next */
export const loadEsmModule = <T>(modulePath: URL | string): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  new Function('modulePath', `return import(modulePath);`)(
    modulePath,
  ) as Promise<T>

/* istanbul ignore next -- used in worker */
export const getPositionAtFactory = (text: string) => {
  const lines = text.split('\n')
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
  text,
}: {
  start: Point | { offset: number }
  end: Point | { offset: number }
  text?: string
}): NormalPosition => {
  const startOffset = start.offset
  const endOffset = end.offset
  const range: [number, number] = [startOffset, endOffset]
  const getPositionAt =
    text == null
      ? null
      : /* istanbul ignore next -- used in worker */ getPositionAtFactory(text)
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
  (text: string) =>
  (offset: number): number => {
    for (let i = offset; i >= 0; i--) {
      const char = text[i]
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

/* istanbul ignore next */
export const cjsRequire: CjsRequire =
  typeof require === 'undefined' ? createRequire(import.meta.url) : require
