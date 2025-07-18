import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import eslintImport from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@stylistic': stylistic,
      import: eslintImport,
      react: react,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./../../../../'],
              message: 'Relative imports are not allowed.',
            },
          ],
        },
      ],
      'import/no-anonymous-default-export': 'off',
      '@stylistic/indent': ['error', 2],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-spacing': 'error',
      '@stylistic/block-spacing': 'error',
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      '@stylistic/no-multi-spaces': 'error',
      'comma-dangle': [
        'error',
        'always-multiline',
      ],
      'semi': [
        'error',
        'always',
      ],
      'arrow-parens': [
        'error',
        'as-needed',
      ],
      'react/jsx-boolean-value': [
        'error',
        'never',
      ],
      'object-curly-spacing': [
        'error',
        'always',
      ],
      'array-bracket-spacing': [
        'error',
        'never',
      ],
      'quotes': [
        'error',
        'single',
      ],
      'jsx-quotes': [
        'error',
        'prefer-double',
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 0,
        },
      ],
      'eol-last': [
        'error',
        'always',
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': [
        'error',
        {
          code: 120,
        },
      ],
      '@typescript-eslint/camelcase': 'off',
      // '@typescript-eslint/no-unused-vars': [
      //   'warn',
      //   {
      //     ignoreRestSiblings: true,
      //   },
      // ],
      'no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],
      'no-extra-boolean-cast': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'type',
            [
              'parent',
              'sibling',
            ],
            'index',
          ],
          'newlines-between': 'always',
          'warnOnUnassignedImports': true,
        },
      ],
      'no-nested-ternary': 'error',
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'multiline-block-like' },
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-const' },
        { blankLine: 'always', prev: 'multiline-const', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-let' },
        { blankLine: 'always', prev: 'multiline-let', next: '*' },
        { blankLine: 'always', prev: '*', next: 'multiline-expression' },
        { blankLine: 'always', prev: 'multiline-expression', next: '*' },
      ],
    },
  },
])
