import type { Linter } from 'eslint'

export interface ESLinterProcessorFile {
  text: string
  filename: string
}

// https://eslint.org/docs/developer-guide/working-with-plugins#processors-in-plugins
export interface ESLintProcessor<
  T extends string | ESLinterProcessorFile = string | ESLinterProcessorFile
> {
  supportsAutofix?: boolean
  preprocess?(text: string, filename: string): T[]
  postprocess?(
    messages: Linter.LintMessage[][],
    filename: string,
  ): Linter.LintMessage[]
}

export interface ESLintMdxSettings {
  'mdx/code-blocks'?: boolean
  'mdx/language-mapper'?: false | Record<string, string>
}

export interface ProcessorOptions {
  lintCodeBlocks: boolean
  languageMapper?: false | Record<string, string>
}
