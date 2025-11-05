import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test-setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-setup.ts',
        '**/*.config.ts',
        '**/*.d.ts',
        '__tests__/**',
        'e2e/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@meit/shared': path.resolve(__dirname, '../../packages/shared'),
      '@meit/supabase': path.resolve(__dirname, '../../packages/supabase'),
      '@meit/business-logic': path.resolve(__dirname, '../../packages/business-logic'),
      '@meit/ui-components': path.resolve(__dirname, '../../packages/ui-components'),
    },
  },
});
