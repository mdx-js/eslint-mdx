export const getGlobals = <
  T extends Record<string, unknown> | string[],
  G extends {}
>(
  sources: T,
  initialGlobals: G = {} as G,
): Record<keyof G | (T extends Array<infer R> ? R : keyof T), false> =>
  (Array.isArray(sources) ? sources : Object.keys(sources)).reduce(
    (globals, source) =>
      Object.assign(globals, {
        [source]: false,
      }),
    // FIXME: find a better solution
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    initialGlobals,
  )
