import mdx from '@mdx-js/mdx'

export const processors = {
  '.mdx': {
    preprocess(code) {
      return [mdx.sync(code)]
    },
    postprocess: function(messages) {
      return [].concat(...messages)
    },
  },
}

export const configs = {
  recommended: {
    plugins: ['@rxts/mdx'],
    overrides: [
      {
        files: '*.mdx',
        rules: {
          'no-unused-vars': [
            2,
            {
              vars: 'local',
              varsIgnorePattern: '^makeShortcode$',
            },
          ],
          'prettier/prettier': 0,
          'react/prop-types': 0,
          'react/react-in-jsx-scope': 0,
        },
      },
    ],
  },
}
