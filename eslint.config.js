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
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
          allowWithName: 'Props$',
        },
      ],
      'no-console': 'warn',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@lucide/astro',
              message:
                'Do not import from "@lucide/astro". Use direct imports to improve dev performance e.g. import ChevronDown from "@lucide/astro/icons/chevron-down".',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx,astro}'],
    ignores: ['**/*.config.*'],
    plugins: {
      perfectionist,
    },
    rules: {
      // Avoid inline (implicit) returns in arrow functions
      // 'arrow-body-style': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
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
]
