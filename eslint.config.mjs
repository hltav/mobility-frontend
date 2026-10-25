import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import template from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '.angular/**', '.migration-baselines/**'],
  },
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { '@angular-eslint': angular },
    rules: {
      ...angular.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='zod'] > ImportDefaultSpecifier",
          message: 'Use import * as z from zod para preservar tree-shaking no esbuild.',
        },
        {
          selector: "ImportDeclaration[source.value='zod'] > ImportSpecifier[imported.name='z']",
          message: 'Use import * as z from zod para preservar tree-shaking no esbuild.',
        },
      ],
    },
    processor: template.processors['extract-inline-html'],
  },
  {
    files: ['src/**/*.html'],
    languageOptions: { parser: templateParser },
    plugins: { '@angular-eslint/template': template },
    rules: {
      ...template.configs.recommended.rules,
      ...template.configs.accessibility.rules,
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
    },
  },
  // Dívida observada antes da introdução do lint. Fora destes arquivos, a regra é erro.
  {
    files: [
      'src/app/core/services/bus-lines.service.ts',
      'src/app/core/services/favorites.service.ts',
      'src/app/core/services/real-time.service.ts',
      'src/app/shared/components/map/map.component.ts',
      'src/app/features/profile/profile.component.spec.ts',
    ],
    rules: { '@typescript-eslint/no-explicit-any': 'warn' },
  },
  {
    files: ['src/app/core/services/favorites.service.ts'],
    rules: { '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['src/app/features/favorites/favorites.spec.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 'warn' },
  },
  {
    files: ['src/app/shared/components/toast/toast.component.ts'],
    rules: { '@angular-eslint/prefer-inject': 'warn' },
  },
  {
    files: ['src/app/shared/components/toast/**/*.html'],
    rules: { '@angular-eslint/template/prefer-control-flow': 'warn' },
  },
);
