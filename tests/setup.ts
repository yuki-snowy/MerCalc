import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { resetDemoAssets } from '../src/lib/demo-store';

/**
 * 各テスト後にデモ用メモリストアを初期化する。
 * （テスト間の状態汚染を防ぐ現場の定石）
 */
afterEach(() => {
  resetDemoAssets();
});
