const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'dist/*',
      'build/*',
      'node_modules/*',
      '.expo/*',
      'web-build/*',
      'android/*',
      'ios/*',
      '*.generated.*',
    ],
  },
  {
    rules: {
      // Prettier conflicts - configure to handle line endings automatically
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // General React rules
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+

      // Common JavaScript/TypeScript rules
      'no-unused-vars': 'off', // Turn off base rule in favor of TypeScript version
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]);
// This configuration file is for ESLint, a tool for identifying and fixing problems in JavaScript code.
// It extends the Expo ESLint configuration and includes Prettier for code formatting.
