import eslintPluginAstro from 'eslint-plugin-astro'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default [
  ...tsEslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx,astro}'],
    plugins: {
      perfectionist,
    },
    rules: {
      // Avoid inline (implicit) returns in arrow functions
      // 'arrow-body-style': ['error', 'always'],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          partitionByComment: 'keep-order',
        },
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 'always',
          internalPattern: ['^@/'],
          groups: [
            'type',
            'side-effect',
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
        },
      ],
      'perfectionist/sort-exports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
        },
      ],
    },
  },
  {
    ignores: ['dist/**', '.astro/**'],
  },
]
