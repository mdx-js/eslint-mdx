declare module 'espree/lib/token-translator' {
  import type * as acorn from 'acorn'

  export default TokenTranslator

  export interface Location {
    /** The start position. */
    start: acorn.Position
    /** The end position. */
    end: acorn.Position
  }

  export type Range = [number, number]

  export interface EsprimaToken {
    /** The type of this token. */
    type: string
    /** The string content of the token. */
    value: string
    /** Location in source text. */
    loc: Location | undefined
    /** Start column. */
    start: number | undefined
    /** End column. */
    end: number | undefined
    /** [start, end] range */
    range: Range | undefined
  }

  declare function TokenTranslator(
    acornTokTypes: Record<string, acorn.TokenType>,
    code: string,
  ): void

  declare class TokenTranslator {
    _acornTokTypes: Record<string, acorn.TokenType>

    constructor(acornTokTypes: Record<string, acorn.TokenType>, code: string)

    onToken(
      token: acorn.Token,
      extra: {
        ecmaVersion: 'latest' | 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
        tokens: EsprimaToken[]
      },
    ): void
  }
}
