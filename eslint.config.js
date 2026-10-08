import parser from '@typescript-eslint/parser';
import gyral from '@gyral/core/eslint';

export default [{ ignores: ['.agents/**', 'vendor/**', 'node_modules/**', 'dist/**', 'artifacts/**'] }, {
  files: ['src/**/*.ts', 'tests/**/*.ts', 'packages/*/src/**/*.ts'],
  languageOptions: { parser, parserOptions: { sourceType: 'module', ecmaVersion: 'latest' } },
  ...gyral.configs.recommended,
}];
