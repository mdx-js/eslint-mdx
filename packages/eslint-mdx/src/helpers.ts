/* eslint-disable unicorn/no-await-expression-member */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

import type { SourceLocation } from 'estree'
import { createSyncFn } from 'synckit'
import type { Node, Position } from 'unist'

import type {
  MdxNode,
  ValueOf,
  WorkerOptions,
  WorkerParseResult,
  WorkerProcessResult,
} from './types'

export const MdxNodeType = {
  FLOW_EXPRESSION: 'mdxFlowExpression',
  JSX_FLOW_ELEMENT: 'mdxJsxFlowElement',
  JSX_TEXT_ELEMENT: 'mdxJsxTextElement',
  TEXT_EXPRESSION: 'mdxTextExpression',
  JS_ESM: 'mdxjsEsm',
} as const

export type MdxNodeType = ValueOf<typeof MdxNodeType>

export const MDX_NODE_TYPES = [
  MdxNodeType.FLOW_EXPRESSION,
  MdxNodeType.JSX_FLOW_ELEMENT,
  MdxNodeType.JSX_TEXT_ELEMENT,
  MdxNodeType.TEXT_EXPRESSION,
  MdxNodeType.JS_ESM,
] as const

export const isMdxNode = (node: Node): node is MdxNode =>
  MDX_NODE_TYPES.includes(node.type as MdxNodeType)

export interface BaseNode {
  type: string
  loc: SourceLocation
  range: [number, number]
  start?: number
  end?: number
}

export const normalizePosition = (loc: Position): Omit<BaseNode, 'type'> => {
  const start = loc.start.offset
  const end = loc.end.offset
  return {
    range: [start, end],
    loc,
    start,
    end,
  }
}

export const last = <T>(items: T[] | readonly T[]) =>
  items && items[items.length - 1]

export const arrayify = <T, R = T extends Array<infer S> ? S : T>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
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
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function('modulePath', `return import(modulePath);`)(
    modulePath,
  ) as Promise<T>

/**
 * Loads CJS and ESM modules based on extension
 * @param modulePath path to the module
 * @returns
 */
export const loadModule = async <T>(modulePath: string): Promise<T> => {
  const esModulePath = path.isAbsolute(modulePath)
    ? pathToFileURL(modulePath)
    : modulePath
  switch (path.extname(modulePath)) {
    /* istanbul ignore next */
    case '.mjs': {
      return (await loadEsmModule<{ default: T }>(esModulePath)).default
    }
    /* istanbul ignore next */
    case '.cjs': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
      return require(modulePath)
    }
    default: {
      // The file could be either CommonJS or ESM.
      // CommonJS is tried first then ESM if loading fails.
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
        return require(modulePath)
      } catch (err) {
        /* istanbul ignore if */
        if ((err as { code: string }).code === 'ERR_REQUIRE_ESM') {
          // Load the ESM configuration file using the TypeScript dynamic import workaround.
          // Once TypeScript provides support for keeping the dynamic import this workaround can be
          // changed to a direct dynamic import.
          return (await loadEsmModule<{ default: T }>(esModulePath)).default
        }

        throw err
      }
    }
  }
}

export const requirePkg = async <T>(
  plugin: string,
  prefix: string,
  filePath?: string,
): Promise<T> => {
  let packages: string[]
  if (filePath && /^\.\.?([/\\]|$)/.test(plugin)) {
    packages = [path.resolve(path.dirname(filePath), plugin)]
  } else {
    prefix = prefix.endsWith('-') ? prefix : prefix + '-'
    packages = [
      plugin,
      plugin.startsWith('@')
        ? plugin.replace('/', '/' + prefix)
        : prefix + plugin,
    ]
  }
  let error: Error
  for (const pkg of packages) {
    try {
      return await loadModule<T>(pkg)
    } catch (err) {
      if (!error) {
        error = err as Error
      }
    }
  }
  throw error
}

const workerPath = require.resolve('./worker')

export const performSyncWork = createSyncFn(workerPath) as ((
  options: Omit<WorkerOptions, 'process'>,
) => WorkerParseResult) &
  ((options: WorkerOptions & { process: true }) => WorkerProcessResult)
