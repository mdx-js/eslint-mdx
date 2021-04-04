export interface ESLintMdxSettings {
  'mdx/code-blocks'?: boolean
  'mdx/language-mapper'?: false | Record<string, string>
}

export interface ProcessorOptions {
  lintCodeBlocks: boolean
  languageMapper?: false | Record<string, string>
}
