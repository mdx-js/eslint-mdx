import { last } from 'eslint-mdx'

export const DEFAULT_LANGUAGE_MAPPER: Record<string, string> = {
  javascript: 'js',
  javascriptreact: 'jsx',
  typescript: 'ts',
  typescriptreact: 'tsx',
  markdown: 'md',
  mdown: 'md',
  mkdn: 'md',
}

export function getShortLang(
  filename: string,
  languageMapper?: false | Record<string, string>,
): string {
  const language = last(filename.split('.'))
  if (languageMapper === false) {
    return language
  }
  languageMapper = { ...DEFAULT_LANGUAGE_MAPPER, ...languageMapper }
  const lang = language.toLowerCase()
  return languageMapper[language] || languageMapper[lang] || lang
}
