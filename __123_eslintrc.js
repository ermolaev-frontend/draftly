module.exports = {
  'extends': [],
  'plugins': [
    '@stylistic',
  ],
  'rules': {
    'no-restricted-imports': [
      'warn',
      {
        'patterns': [
          {
            'group': ['**../../../../'],
            'message': 'Relative imports are not allowed.',
          },
        ],
      },
    ],
    'import/no-anonymous-default-export': 'off',
    '@stylistic/indent': ['warn', 2],
    '@stylistic/array-bracket-spacing': ['warn', 'never'],
    '@stylistic/arrow-spacing': 'warn',
    '@stylistic/block-spacing': 'warn',
    '@stylistic/comma-spacing': ['warn', { 'before': false, 'after': true }],
    '@stylistic/key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true }],
    '@stylistic/keyword-spacing': ['warn', { 'before': true, 'after': true }],
    '@stylistic/no-multi-spaces': 'warn',
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
        'max': 1,
        'maxEOF': 0,
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
        'code': 120,
      },
    ],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        'ignoreRestSiblings': true,
      },
    ],
    'no-unused-vars': [
      'warn',
      {
        'ignoreRestSiblings': true,
      },
    ],
    'no-extra-boolean-cast': 'off',
    'import/order': [
      'warn',
      {
        'groups': [
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
    'no-nested-ternary': 'warn',
    'padding-line-between-statements': [
      'warn',
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'return',
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'multiline-block-like',
      },
      {
        'blankLine': 'always',
        'prev': 'multiline-block-like',
        'next': '*',
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'multiline-const',
      },
      {
        'blankLine': 'always',
        'prev': 'multiline-const',
        'next': '*',
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'multiline-let',
      },
      {
        'blankLine': 'always',
        'prev': 'multiline-let',
        'next': '*',
      },
      {
        'blankLine': 'always',
        'prev': '*',
        'next': 'multiline-expression',
      },
      {
        'blankLine': 'always',
        'prev': 'multiline-expression',
        'next': '*',
      },
    ],
  },
};
