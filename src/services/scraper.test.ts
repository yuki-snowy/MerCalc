import { describe, expect, it } from 'vitest';
import { estimateMarketPrice } from './scraper';

describe('estimateMarketPrice', () => {
  it('購入価格と状態から推定相場を算出する', () => {
    const result = estimateMarketPrice({
      name: 'iPad Air',
      category: 'ガジェット',
      condition: 'good',
      purchasePrice: 100000,
    });

    // good = 0.65
    expect(result.estimatedPrice).toBe(65000);
    expect(result.currency).toBe('JPY');
    expect(result.source).toBe('estimate');
    expect(result.confidence).toBe(0.72);
  });

  it('購入価格がない場合はカテゴリ基準で推定する', () => {
    const result = estimateMarketPrice({
      name: '無印良品 ソファ',
      category: '家具',
      condition: 'fair',
    });

    expect(result.estimatedPrice).toBeGreaterThan(0);
    expect(result.searchUrl).toContain('https://jp.mercari.com/search');
    expect(result.searchUrl).toContain('keyword');
  });

  it('同じ入力なら決定的な推定値を返す（再現性）', () => {
    const input = {
      name: 'YAMAHA P-125',
      category: '楽器' as const,
      condition: 'good' as const,
    };
    const a = estimateMarketPrice(input);
    const b = estimateMarketPrice(input);
    expect(a.estimatedPrice).toBe(b.estimatedPrice);
  });

  it('状態が悪いほど推定値が下がる', () => {
    const base = {
      name: 'テスト家電',
      category: '家電',
      purchasePrice: 40000,
    };
    const likeNew = estimateMarketPrice({ ...base, condition: 'like_new' });
    const poor = estimateMarketPrice({ ...base, condition: 'poor' });
    expect(likeNew.estimatedPrice).toBeGreaterThan(poor.estimatedPrice);
  });
});
