// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    settings: {
      'import/core-modules': ['vitest'],
    },
    rules: {
      'import/no-unresolved': 'off',
      'import/first': 'off',
    },
  },
]);
