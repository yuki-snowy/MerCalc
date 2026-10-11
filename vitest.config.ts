import { defineConfig } from 'vitest/config';

/**
 * 現場でよく使う構成:
 * - Vitest（Vite 系プロジェクトの標準）
 * - カバレッジは v8（追加ランタイム不要で CI 向き）
 * - 既定は node。DOM が必要なテストだけファイル先頭で jsdom を指定
 */
export default defineConfig({
  test: {
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', 'dist', '.vercel', '.astro'],
    clearMocks: true,
    restoreMocks: true,
    env: {
      PUBLIC_DEMO_MODE: 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/services/**/*.ts',
        'src/utils/**/*.ts',
        'src/lib/demo-store.ts',
        'src/pages/api/**/*.ts',
      ],
      exclude: ['**/*.{test,spec}.{ts,tsx}', '**/types/**'],
    },
  },
});
