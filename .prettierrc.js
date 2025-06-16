module.exports = {
  // Basic formatting - matches my style
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',

  // Line length and wrapping - longer lines for readability
  printWidth: 100,
  proseWrap: 'preserve',

  // Indentation - 2 spaces
  tabWidth: 2,
  useTabs: false,

  // Trailing commas and brackets
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // Line endings - consistent across platforms
  endOfLine: 'lf',

  // File-specific overrides
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 120,
      },
    },
    {
      files: '*.json',
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        printWidth: 100,
        trailingComma: 'es5',
      },
    },
  ],
};
// This configuration file is for Prettier, a code formatter.
// It specifies various formatting rules such as semicolons, quotes, trailing commas, and more.
