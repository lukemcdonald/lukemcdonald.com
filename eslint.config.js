import pluginJs from '@eslint/js'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['node_modules', 'build', 'public'],
  },
  {
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      perfectionist,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      // React rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',

      // React Hooks rules
      ...pluginReactHooks.configs.recommended.rules,

      // React Refresh rules - allow route exports (loader, action, meta)
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['loader', 'action', 'meta', 'links', 'handle', 'shouldRevalidate']
        }
      ],

      // Turn off rules that conflict with Perfectionist
      'import/order': 'off',
      'react/jsx-sort-props': 'off',
      'sort-imports': 'off',
      'sort-keys': 'off',

      // Perfectionist rules
      'perfectionist/sort-imports': [
        'warn',
        {
          customGroups: {
            value: {
              internal: ['^#app/.*'],
              react: ['^react$', '^react-.+', '^prop-types$'],
            },
          },
          groups: [
            'react',
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
            'internal-type',
            ['parent-type', 'sibling-type', 'index-type'],
            'unknown',
          ],
          newlinesBetween: 'always',
        },
      ],
      'perfectionist/sort-interfaces': [
        'warn',
        {
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-object-types': [
        'warn',
        {
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-objects': [
        'warn',
        {
          partitionByComment: true,
          partitionByNewLine: true,
        },
      ],
      'perfectionist/sort-jsx-props': [
        'warn',
        {
          type: 'alphabetical',
        },
      ],
    },
    settings: {
      perfectionist: {
        order: 'asc',
        partitionByComment: true,
        type: 'natural',
      },
      react: {
        version: 'detect',
      },
    },
  },
)
