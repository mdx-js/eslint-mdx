import path from 'node:path'

import { languageOptions } from '../helpers.js'

export const createLanguageOptions = ({
  ignoreRemarkConfig = false,
  remarkConfig = 'native.remarkrc',
}: {
  ignoreRemarkConfig?: boolean
  remarkConfig?: string
} = {}) => ({
  ...languageOptions,
  parserOptions: {
    ...languageOptions.parserOptions,
    ...(ignoreRemarkConfig
      ? { ignoreRemarkConfig: true }
      : {
          remarkConfigPath: path.resolve(
            import.meta.dirname,
            '../remark-fixtures',
            remarkConfig,
          ),
        }),
  },
})
