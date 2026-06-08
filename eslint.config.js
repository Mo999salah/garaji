const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      '.stitch/**',
      '.stitch-mcp/**',
      'scripts/**',
      'node_modules/**',
      'e2e/**',
      'playwright.config.ts',
    ],
  },
  {
    rules: {
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react/display-name': 'warn',
      'unicode-bom': 'warn',
    },
  },
]);
