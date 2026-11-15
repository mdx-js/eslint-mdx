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

  function TokenTranslator(acornTokTypes: Record<string, acorn.TokenType>, code: string): void

  class TokenTranslator {
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

// https://github.com/syntax-tree/mdast-util-frontmatter/issues/2
declare module 'mdast-util-frontmatter' {
  import type { Literal } from 'mdast'

  interface Toml extends Literal {
    type: 'toml'
  }

  interface Json extends Literal {
    type: 'json'
  }

  interface Custom extends Literal {
    type: 'custom'
  }

  module 'mdast' {
    interface RootContentMap {
      custom: Custom
      json: Json
      toml: Toml
    }

    interface FrontmatterContentMap {
      custom: Custom
      json: Json
      toml: Toml
    }
  }
}
