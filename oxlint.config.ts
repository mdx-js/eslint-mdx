import { defineConfig } from '@1stg/oxlint-config'

export default defineConfig({
  ignorePatterns: ['test/fixtures'],
  rules: {
    'no-conditional-expect': 'off',
    'no-disabled-tests': 'off',
    'no-standalone-expect': 'off',
    eqeqeq: 'off',
    'no-await-in-loop': 'off',
    'no-magic-numbers': 'off',
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'prefer-snapshot-hint': 'off',
    'no-map-spread': 'off',
    'no-empty-object-type': 'off',
    'no-array-sort': 'off',
  },
})
