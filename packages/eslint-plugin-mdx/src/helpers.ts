export const getGlobals = <
  T extends Record<string, unknown> | string[],
  G extends Record<string, boolean>,
  R extends G = G & Record<T extends Array<infer R> ? R : keyof T, false>
>(
  sources: T,
  initialGlobals: G = {} as G,
): R =>
  (Array.isArray(sources)
    ? (sources as string[])
    : Object.keys(sources)
  ).reduce(
    (globals, source) =>
      Object.assign(globals, {
        [source]: false,
      }),
    initialGlobals as R,
  )
