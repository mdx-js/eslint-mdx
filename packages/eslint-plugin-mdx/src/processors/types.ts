import type { Linter } from 'eslint'

// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins
export interface ESLintProcessor {
  supportsAutofix?: boolean
  preprocess?(
    text: string,
    filename: string,
  ): Array<string | { text: string; filename: string }>
  postprocess?(
    messages: Linter.LintMessage[][],
    filename: string,
  ): Linter.LintMessage[]
}

export interface ProcessorOptions {
  lintCodeBlocks: boolean
}
