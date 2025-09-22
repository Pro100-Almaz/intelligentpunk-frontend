// @ts-check

/** @type {import('eslint').Linter.FlatConfig[]} */
let withNuxt = []

try {
  // Load Nuxt’s generated ESLint config (only exists after `nuxi prepare` or `nuxi dev`)
  withNuxt = (await import('./.nuxt/eslint.config.mjs')).default
} catch {
  console.warn('⚠️  Skipping Nuxt ESLint config because `.nuxt/eslint.config.mjs` was not found')
}

export default [
  ...withNuxt,
  {
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/max-attributes-per-line': ['error', { singleline: 3 }]
    }
  }
]
