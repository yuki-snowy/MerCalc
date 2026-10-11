import { describe, expect, it } from 'vitest';
import type { Asset } from '../types/asset';
import { buildCategoryShares, buildMonthlyTrend } from './analytics';

function stubAsset(partial: Partial<Asset> & Pick<Asset, 'id' | 'name'>): Asset {
  return {
    user_id: null,
    category: 'ガジェット',
    brand: null,
    purchase_price: 10000,
    purchase_date: '2024-01-15',
    market_price: 7000,
    market_price_updated_at: null,
    condition: 'good',
    notes: null,
    image_url: null,
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
    ...partial,
  };
}

describe('buildMonthlyTrend', () => {
  it('指定月数ぶんの系列を返す', () => {
    const trend = buildMonthlyTrend([], 6, new Date('2025-06-15'));
    expect(trend).toHaveLength(6);
    expect(trend[0].label).toBe('1月');
    expect(trend[5].label).toBe('6月');
  });

  it('購入月以降に累積される', () => {
    const assets = [
      stubAsset({
        id: 'a',
        name: 'A',
        purchase_date: '2025-03-10',
        purchase_price: 20000,
        market_price: 12000,
      }),
      stubAsset({
        id: 'b',
        name: 'B',
        purchase_date: '2025-05-01',
        purchase_price: 10000,
        market_price: 8000,
        category: '家電',
      }),
    ];

    const trend = buildMonthlyTrend(assets, 4, new Date('2025-06-15'));
    const march = trend.find((p) => p.key === '2025-03');
    const may = trend.find((p) => p.key === '2025-05');
    const june = trend.find((p) => p.key === '2025-06');

    expect(march?.purchaseSpend).toBe(20000);
    expect(march?.cumulativeMarket).toBe(12000);
    expect(may?.purchaseSpend).toBe(10000);
    expect(june?.cumulativePurchase).toBe(30000);
    expect(june?.cumulativeMarket).toBe(20000);
    expect(june?.assetCount).toBe(2);
  });
});

describe('buildCategoryShares', () => {
  it('相場ベースの構成比を返す', () => {
    const shares = buildCategoryShares([
      stubAsset({
        id: '1',
        name: 'A',
        category: 'ガジェット',
        market_price: 75,
        purchase_price: 100,
      }),
      stubAsset({
        id: '2',
        name: 'B',
        category: '家具',
        market_price: 25,
        purchase_price: 40,
      }),
    ]);

    expect(shares[0]).toMatchObject({
      category: 'ガジェット',
      share: 0.75,
      count: 1,
    });
    expect(shares[1].share).toBe(0.25);
  });
});
