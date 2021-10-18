import type { Rule } from 'eslint'

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
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    initialGlobals as R,
  )

const PRIVATE_API_VERSION = 8

export const getBuiltinRule = (ruleId: string) => {
  // TODO: Remove this when we drop support for ESLint < 8
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const { version: eslintVersion } = require('eslint/package.json') as {
    version: string
  }

  const majorVersion = Number.parseInt(eslintVersion.split('.')[0], 10)

  /* istanbul ignore next */
  if (majorVersion < PRIVATE_API_VERSION) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    return require(`eslint/lib/rules/${ruleId}`) as Rule.RuleModule
  }

  // prettier-ignore
  return (
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    require('eslint/use-at-your-own-risk') as typeof import('eslint/use-at-your-own-risk')
  ).builtinRules.get(ruleId)
}
