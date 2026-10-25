// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const i18next = require('eslint-plugin-i18next');

// Feature-first layout: app -> core -> features -> shared. Features never import core/app,
// and one feature reaches another only through its public `index.ts`.
const fs = require('node:fs');

const featureNames = fs.existsSync('./src/features')
  ? fs.readdirSync('./src/features', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : [];

const LAYER_ZONES = [
  { target: './src/shared', from: './src/features' },
  { target: './src/shared', from: './src/core' },
  { target: './src/shared', from: './src/app' },
  { target: './src/features', from: './src/core' },
  { target: './src/features', from: './src/app' },
].map((zone) => ({ ...zone, message: 'Layering: app -> core -> features -> shared. Import only downward.' }));

const FEATURE_ZONES = featureNames.flatMap((name) =>
  featureNames
    .filter((other) => other !== name)
    .map((other) => ({
      target: `./src/features/${name}`,
      from: `./src/features/${other}`,
      except: ['./index.ts'],
      message: `Feature '${name}' may only import feature '${other}' through its public index.ts.`,
    }))
);

const RESTRICTED_ZONES = [...LAYER_ZONES, ...FEATURE_ZONES];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    // Inline `eslint-disable` comments are ignored: fix the code instead of suppressing the rule.
    linterOptions: { noInlineConfig: true },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // `const X = {...} as const` + `type X = ...` (same name) is the project's pattern for constant sets; the compiler already rejects real redeclarations.
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true, 'ts-nocheck': true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'warn',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-restricted-paths': ['error', { zones: RESTRICTED_ZONES }],
    },
  },
  {
    // The one place that may `require`: it loads the dev-only mock inside a `__DEV__` branch so Metro removes the
    // mock from release bundles (a static import would ship it).
    files: ['src/features/auth/api/auth-api.ts'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Hardcoded UI text must go through i18n (ko/en).
    files: ['src/**/*.tsx'],
    ...i18next.configs['flat/recommended'],
  },
]);
