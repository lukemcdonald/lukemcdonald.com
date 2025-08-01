import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tsEslint from "typescript-eslint";

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
      'no-console': 'warn'
    }
  },
  {
    ignores: [
      'dist/**',
      '.astro/**',
    ],
  },
]
