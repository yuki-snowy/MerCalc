import { describe, expect, it } from 'vitest';
import { suggestCategory } from './category';

describe('suggestCategory', () => {
  it('空文字は「その他」で信頼度 0', () => {
    expect(suggestCategory('')).toEqual({
      category: 'その他',
      confidence: 0,
      matchedKeywords: [],
    });
  });

  it('ガジェット系キーワードを判定する', () => {
    const result = suggestCategory('iPad Air 第5世代');
    expect(result.category).toBe('ガジェット');
    expect(result.confidence).toBeGreaterThan(0.3);
    expect(result.matchedKeywords.map((k) => k.toLowerCase())).toContain('ipad');
  });

  it('楽器系キーワードを判定する', () => {
    const result = suggestCategory('YAMAHA P-125 電子ピアノ');
    expect(result.category).toBe('楽器');
    expect(result.matchedKeywords.length).toBeGreaterThan(0);
  });

  it('家電系キーワードを判定する', () => {
    const result = suggestCategory('ダイソン V12 掃除機');
    expect(result.category).toBe('家電');
  });

  it('未知の製品名は「その他」にフォールバックする', () => {
    const result = suggestCategory('謎の未分類オブジェクト XYZ');
    expect(result.category).toBe('その他');
    expect(result.confidence).toBe(0);
  });
});
