// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "docs/prototype/**"],
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/index', '**/index.ts', '**/index.tsx'],
              message:
                'Barrel files are not allowed. Import directly from the module that defines the symbol.',
            },
          ],
        },
      ],
    },
  },
]);
