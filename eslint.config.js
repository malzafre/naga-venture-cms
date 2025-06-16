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
      // Prettier integration - use .prettierrc.js for all formatting rules
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
        },
      ],

      // Disable conflicting ESLint rules that Prettier handles
      'linebreak-style': 'off',
      'max-len': 'off',
      indent: 'off',
      quotes: 'off',
      semi: 'off',
      'comma-dangle': 'off',

      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // anny

      // JavaScript/TypeScript best practices
      'no-unused-vars': 'off',
      'no-console': 'off', // Allow console statements for debugging
      'prefer-const': 'error',
      'no-var': 'error',
      'no-debugger': 'warn',

      // Import organization
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
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/extensions': 'off', // TypeScript handles this
    },
  },
]);
// This configuration file is for ESLint, a tool for identifying and fixing problems in JavaScript code.
// It extends the Expo ESLint configuration and includes Prettier for code formatting.
