declare module 'espree/lib/token-translator' {
  export default TokenTranslator

  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  export type acorn = typeof import('acorn')

  export interface Location {
    /**
     * The start position.
     */
    start: acorn.Position
    /**
     * The end position.
     */
    end: acorn.Position
  }

  export type Range = [number, number]

  export interface EsprimaToken {
    /**
     * The type of this token.
     */
    type: string
    /**
     * The string content of the token.
     */
    value: string
    /**
     * Location in source text.
     */
    loc: Location | undefined
    /**
     * start column.
     */
    start: number | undefined
    /**
     * end column.
     */
    end: number | undefined
    /**
     * [start, end] range
     */
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
        // eslint-disable-next-line no-magic-numbers, sonar/max-union-size
        ecmaVersion: 'latest' | 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
        tokens: EsprimaToken[]
      },
    ): void
  }
}
