import path from 'path'

export { parseForESLint } from './parser'

export const configs = {
  recommended: {
    parser: path.resolve(__dirname, 'parser'),
    plugins: ['@rxts/mdx'],
    rules: {
      'react/react-in-jsx-scope': 0,
    },
  },
}
