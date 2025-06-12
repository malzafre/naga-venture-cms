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
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto', // Use auto line endings to avoid conflicts
          useTabs: false, // Use spaces instead of tabs
          tabWidth: 2,
          singleQuote: true,
          semi: true,
          trailingComma: 'es5',
          printWidth: 80,
        },
        {
          usePrettierrc: true, // Use .prettierrc.js file for configuration
        },
      ],

      // Disable line ending enforcement
      'linebreak-style': 'off',

      // General React rules
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Common JavaScript/TypeScript rules
      'no-unused-vars': 'off', // Turn off base rule in favor of TypeScript version
      'no-console': 'off', // Warn on console usage instead of error
      'prefer-const': 'error',
      'no-var': 'error',

      // Import rules
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
// This configuration file is for ESLint, a tool for identifying and fixing problems in JavaScript code.
// It extends the Expo ESLint configuration and includes Prettier for code formatting.
