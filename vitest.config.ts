/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // Enable path aliases from tsconfig.json
  ],
  test: {
    // Basic test settings
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/setupTests.ts',
    
    // Only run tests in app directory
    include: ['app/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['testing/**/*', 'node_modules/**/*'],

    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'stable',
      },
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.ts', '**/*.d.ts', '**/*.test.{ts,tsx}'],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },

    // Performance settings
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },

  // Path aliases
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
});