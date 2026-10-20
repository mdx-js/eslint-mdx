import { createRequire } from 'node:module'

import type * as ESLint from 'eslint'
import type { CjsRequire } from 'eslint-mdx'

export const getGlobals = <
  T extends Record<string, unknown> | string[],
  G extends Record<string, boolean>,
  R extends G = G & Record<T extends Array<infer R> ? R : keyof T, false>,
>(
  sources: T,
  initialGlobals: G = {} as G,
): R =>
  (Array.isArray(sources)
    ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (sources as string[])
    : Object.keys(sources)
  ).reduce(
    (globals, source) =>
      Object.assign(globals, {
        [source]: false,
      }),
    initialGlobals as R,
  )

const importMetaUrl = import.meta.url

/* istanbul ignore next */
export const cjsRequire: CjsRequire = importMetaUrl
  ? createRequire(importMetaUrl)
  : require

export const getESLinter = (linterPath?: string) =>
  cjsRequire<typeof ESLint>(linterPath || 'eslint').Linter
