/* eslint-disable unicorn/no-await-expression-member */
import path from 'path'

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

export const FALLBACK_PARSERS = [
  '@typescript-eslint/parser',
  '@babel/eslint-parser',
  'babel-eslint',
  'espree',
] as const

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

export const shouldTryEsm = (err: unknown) =>
  (err as { code: string }).code === 'ERR_REQUIRE_ESM' ||
  // for jest
  (err as Error).message === 'Cannot use import statement outside a module'

/**
 * Loads CJS and ESM modules based on extension
 * @param modulePath path to the module
 * @returns
 */
export const loadModule = async <T>(modulePath: string): Promise<T> => {
  // The file could be either CommonJS or ESM.
  // CommonJS is tried first then ESM if loading fails.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
    return require(modulePath)
  } catch (err) {
    /* istanbul ignore if */
    if (shouldTryEsm(err)) {
      // Load the ESM configuration file using the TypeScript dynamic import workaround.
      // Once TypeScript provides support for keeping the dynamic import this workaround can be
      // changed to a direct dynamic import.
      /* istanbul ignore next */
      return (await loadEsmModule<{ default: T }>(modulePath)).default
    }

    throw err
  }
}

export const requirePkg = async <T>(
  plugin: string,
  prefix: string,
  filePath?: string,
): Promise<T> => {
  if (filePath && /^\.\.?([/\\]|$)/.test(plugin)) {
    plugin = path.resolve(path.dirname(filePath), plugin)
  }
  prefix = prefix.endsWith('-') ? prefix : prefix + '-'
  const packages = [
    plugin,
    plugin.startsWith('@')
      ? plugin.replace('/', '/' + prefix)
      : prefix + plugin,
  ]
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
