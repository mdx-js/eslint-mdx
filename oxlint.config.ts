import { defineConfig } from '@1stg/oxlint-config'

export default defineConfig({
  rules: {
    eqeqeq: 'off',
    'no-await-in-loop': 'off',
    'no-empty-function': 'off',
    'no-magic-numbers': 'off',
    'no-shadow': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'no-conditional-expect': 'off',
    'no-disabled-tests': 'off',
    'no-standalone-expect': 'off',
    'prefer-snapshot-hint': 'off',
    'no-map-spread': 'off',
    'jsx-no-undef': 'off',
    'ban-ts-comment': 'off',
    'no-empty-object-type': 'off',
    'no-array-sort': 'off',
  },
})
