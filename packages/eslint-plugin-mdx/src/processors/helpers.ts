export const DEFAULT_LANGUAGE_MAPPER = {
  ecmascript: 'js',
  javascript: 'js',
  javascriptreact: 'jsx',
  typescript: 'ts',
  typescriptreact: 'tsx',
  markdown: 'md',
  markdownjsx: 'mdx',
  markdownreact: 'mdx',
  mdown: 'md',
  mkdn: 'md',
} as const

export function getShortLang(
  filename: string,
  languageMapper?: Record<string, string> | false,
): string {
  const language = filename.split('.').at(-1)
  if (languageMapper === false) {
    return language
  }
  languageMapper = languageMapper
    ? { ...DEFAULT_LANGUAGE_MAPPER, ...languageMapper }
    : DEFAULT_LANGUAGE_MAPPER
  const mapped = languageMapper[language]
  if (mapped) {
    return mapped
  }
  const lang = language.toLowerCase()
  return languageMapper[lang] || lang
}
