import { describe, expect, it } from 'vitest';
import { isAppNavActive } from './nav';

describe('isAppNavActive', () => {
  it('ダッシュボードは完全一致のみ', () => {
    expect(isAppNavActive('/dashboard', '/dashboard')).toBe(true);
    expect(isAppNavActive('/dashboard', '/assets')).toBe(false);
  });

  it('資産一覧は詳細ページも含むが新規登録は除く', () => {
    expect(isAppNavActive('/assets', '/assets')).toBe(true);
    expect(isAppNavActive('/assets', '/assets/abc')).toBe(true);
    expect(isAppNavActive('/assets', '/assets/new')).toBe(false);
  });

  it('新規登録は完全一致', () => {
    expect(isAppNavActive('/assets/new', '/assets/new')).toBe(true);
    expect(isAppNavActive('/assets/new', '/assets')).toBe(false);
  });
});
