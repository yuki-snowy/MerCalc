import { describe, expect, it } from 'vitest';
import type { Asset } from '../types/asset';
import {
  buildDepreciationSummary,
  calcAgeYears,
  calcAssetDepreciation,
  calcStraightLineBookValue,
  signalFromDiff,
} from './depreciation';

function stub(partial: Partial<Asset> = {}): Asset {
  return {
    id: 'stub',
    name: 'Stub Asset',
    user_id: null,
    category: 'ガジェット',
    brand: null,
    purchase_price: 100000,
    purchase_date: '2024-01-01',
    market_price: 50000,
    market_price_updated_at: null,
    condition: 'good',
    notes: null,
    image_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('calcStraightLineBookValue', () => {
  it('購入直後は購入額に近い（残存控除前の起点）', () => {
    expect(calcStraightLineBookValue(100000, 0, 4)).toBe(100000);
  });

  it('耐用年数経過後は残存価額（10%）になる', () => {
    expect(calcStraightLineBookValue(100000, 4, 4)).toBe(10000);
    expect(calcStraightLineBookValue(100000, 10, 4)).toBe(10000);
  });

  it('半分経過で概ね中間の簿価になる', () => {
    // 償却対象 90,000 / 4年 * 2年 = 45,000 減 → 55,000
    expect(calcStraightLineBookValue(100000, 2, 4)).toBe(55000);
  });
});

describe('calcAssetDepreciation', () => {
  it('相場が簿価より高ければプラス', () => {
    const dep = calcAssetDepreciation(
      stub({
        purchase_price: 100000,
        purchase_date: '2024-01-01',
        market_price: 70000,
        category: 'ガジェット',
      }),
      new Date('2026-01-01'),
    );

    const expectedBook = calcStraightLineBookValue(
      100000,
      dep.ageYears,
      4,
    );
    expect(dep.bookValue).toBe(expectedBook);
    expect(dep.vsBook).toBe(70000 - expectedBook);
    expect(dep.signal).toBe('plus');
    expect(dep.usefulLifeYears).toBe(4);
  });

  it('相場が簿価より低ければマイナス', () => {
    const dep = calcAssetDepreciation(
      stub({
        purchase_price: 100000,
        market_price: 30000,
        category: '家具',
        purchase_date: '2024-01-01',
      }),
      new Date('2026-01-01'),
    );

    expect(dep.signal).toBe('minus');
    expect(dep.vsBook).toBeLessThan(0);
  });
});

describe('buildDepreciationSummary', () => {
  it('ポートフォリオ全体の対簿価を集計する', () => {
    const summary = buildDepreciationSummary(
      [
        stub({
          id: '1',
          name: 'A',
          purchase_price: 100000,
          market_price: 70000,
          purchase_date: '2024-01-01',
        }),
        stub({
          id: '2',
          name: 'B',
          purchase_price: 100000,
          market_price: 20000,
          purchase_date: '2024-01-01',
        }),
      ],
      new Date('2026-01-01'),
    );

    expect(summary.comparableCount).toBe(2);
    expect(summary.plusCount).toBe(1);
    expect(summary.minusCount).toBe(1);
    expect(summary.vsBook).toBe(
      summary.totalMarketValue - summary.totalBookValue,
    );
    expect(summary.vsBook).toBeLessThan(0);
    expect(summary.signal).toBe('minus');
  });
});

describe('helpers', () => {
  it('年齢年数を日割りで計算する', () => {
    const years = calcAgeYears(
      new Date('2024-01-01'),
      new Date('2025-01-01'),
    );
    expect(years).toBeGreaterThan(0.99);
    expect(years).toBeLessThan(1.02);
  });

  it('signalFromDiff の閾値', () => {
    expect(signalFromDiff(1)).toBe('plus');
    expect(signalFromDiff(-1)).toBe('minus');
    expect(signalFromDiff(0)).toBe('flat');
    expect(signalFromDiff(null)).toBe('unknown');
  });
});
