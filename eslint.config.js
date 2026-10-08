import eslintPluginAstro from 'eslint-plugin-astro'
import globals from 'globals'
import perfectionist from 'eslint-plugin-perfectionist'
import tsEslint from 'typescript-eslint'

const perfectionistRules = {
  // Avoid inline (implicit) returns in arrow functions
  // 'arrow-body-style': ['error', 'always'],
  'perfectionist/sort-exports': [
    'error',
    {
      ignoreCase: true,
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-imports': [
    'error',
    {
      groups: [
        'type',
        'side-effect',
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'unknown',
      ],
      ignoreCase: true,
      internalPattern: ['^@/'],
      newlinesBetween: 1,
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    {
      ignoreCase: true,
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-objects': [
    'error',
    {
      ignoreCase: true,
      order: 'asc',
      partitionByComment: 'keep-order',
      type: 'alphabetical',
    },
  ],
}

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
              message:
                'Do not import from "@lucide/astro". Use direct imports to improve dev performance e.g. import ChevronDown from "@lucide/astro/icons/chevron-down".',
              name: '@lucide/astro',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts', 'src/**/*.{js,jsx,ts,tsx,astro}'],
    ignores: ['**/*.config.*'],
    plugins: {
      perfectionist,
    },
    rules: perfectionistRules,
  },
  {
    files: ['playwright.config.ts'],
    plugins: {
      perfectionist,
    },
    rules: perfectionistRules,
  },
]
