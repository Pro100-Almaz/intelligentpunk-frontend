// @ts-check

import pluginVue from 'eslint-plugin-vue'

/** @type {import('eslint').Linter.FlatConfig[]} */
let withNuxt = []

try {
  // Nuxt generates this after `nuxi prepare` or `nuxi dev`
  withNuxt = (await import('./.nuxt/eslint.config.mjs')).default
} catch {
  console.warn('⚠️  Skipping Nuxt ESLint config because `.nuxt/eslint.config.mjs` was not found')
}

export default [
  ...withNuxt,
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    plugins: { vue: pluginVue },
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }]
    }
  }
]
