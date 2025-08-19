import typescript from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**', 
      '.cache-synpress/**',
      'testing/cache/**',
      'playwright-report/**',
      'test-results/**',
      'public/**',
      '**/*.config.{js,ts}',
      '**/*.min.js'
    ]
  },
  {
    files: ['app/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescript,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        React: 'readonly',
        JSX: 'readonly',
      }
    },
    rules: {
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    }
  }
]