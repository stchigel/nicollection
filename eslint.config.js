import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript-ESLint recommended rules (@typescript-eslint/recommended)
  ...tseslint.configs.recommended,

  // Apply TypeScript rules only to .ts / .tsx files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    rules: {
      // Enforce no implicit any — Constitución IX
      '@typescript-eslint/no-explicit-any': 'error',
      // Catch unused vars (allow underscore prefix for intentionally unused)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Prefer `import type` for type-only imports (tree-shaking)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Allow implicit return types on short functions/arrows
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // Disable formatting rules that conflict with Prettier (T007)
  prettier,

  // Ignore generated and external directories
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'specs/**', '.specify/**'],
  },
)
