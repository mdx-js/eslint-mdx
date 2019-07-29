import path from 'path'

export { parseForESLint } from './parser'

export const configs = {
  recommended: {
    overrides: [
      {
        files: '*.mdx',
        parser: path.resolve(__dirname, 'parser'),
        plugins: ['@rxts/mdx'],
        rules: {
          'react/react-in-jsx-scope': 0,
        },
      },
    ],
  },
}
