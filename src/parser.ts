// eslint-disable-next-line @typescript-eslint/no-triple-slash-reference
/// <reference path="../shim.d.ts" />

import { parse as esParse } from 'espree'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import unified from 'unified'

import { Position, Parent } from 'unist'
import { AST, Linter } from 'eslint'
import { Statement, ModuleDeclaration } from 'estree'

const transNodePos = (position: Position) => {
  const start = position.start.offset
  const end = position.end.offset
  return {
    range: [start, end] as AST.Range,
    loc: {
      ...position,
    },
    start,
    end,
  }
}

const getRawText = (code: string, position: Position) =>
  code.slice(position.start.offset, position.end.offset)

export const parseForESLint = (
  code: string,
  options: Linter.ParserOptions,
): Linter.ESLintParseResult => {
  const root = unified()
    .use<any>(remarkParse)
    .use<any>(remarkStringify)
    .use(remarkMdx)
    .parse(code) as Parent

  const tokens: AST.Token[] = []

  return {
    ast: {
      ...transNodePos(root.position),
      comments: [],
      body: root.children.reduce<Array<Statement | ModuleDeclaration>>(
        (nodes, { position, type }) => {
          if (!['export', 'import', 'jsx'].includes(type)) {
            return nodes
          }

          const rawText = getRawText(code, position)

          let node = {
            ...transNodePos(position),
            value: rawText,
          }

          const { tokens: esTokens, ...AST } = esParse(
            rawText,
            options,
          ) as AST.Program

          const offset = node.start - AST.range[0]

          node = {
            ...AST,
            ...node,
          }

          nodes.push(node as any)
          tokens.push(
            ...esTokens.map(token => {
              const {
                loc: { start: tokenStart, end: tokenEnd },
              } = token
              const start = token.range[0] + offset
              const end = token.range[1] + offset
              const startLine = node.loc.start.line + tokenStart.line - 1
              const startColumn = node.loc.start.column + tokenStart.column - 1
              return {
                ...token,
                start,
                end,
                range: [start, end],
                loc: {
                  start: {
                    line: startLine,
                    column: startColumn,
                  },
                  end: {
                    line: startLine + tokenEnd.line - 1,
                    column: startLine + tokenEnd.column - 1,
                  },
                },
              } as AST.Token
            }),
          )

          return nodes
        },
        [],
      ),
      type: 'Program',
      sourceType: 'module',
      tokens,
    },
    scopeManager: null,
    visitorKeys: null,
  }
}
