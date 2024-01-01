import autoImport from 'unplugin-auto-import/vite'
import { PluginOption } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '^eslint-mdx$': new URL(
        'packages/eslint-mdx/src/index.ts',
        import.meta.url,
      ).toString(),
      '^eslint-plugin-mdx$': new URL(
        'packages/eslint-plugin-mdx/src/index.ts',
        import.meta.url,
      ).toString(),
    },
  },
  plugins: [
    autoImport({
      imports: ['vitest'],
    }) as PluginOption,
  ],
  test: {
    setupFiles: ['node_modules/eslint/lib/linter/linter.js'],
    coverage: {
      provider: 'istanbul',
    },
  },
})
