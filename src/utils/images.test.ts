import { describe, expect, it } from 'vitest';
import { getCategoryDefaultImage, resolveAssetImageUrl } from './images';

describe('resolveAssetImageUrl', () => {
  it('image_url があればそれを使う', () => {
    expect(
      resolveAssetImageUrl({
        image_url: 'https://example.com/a.jpg',
        category: 'ガジェット',
      }),
    ).toBe('https://example.com/a.jpg');
  });

  it('image_url が空ならカテゴリ既定画像', () => {
    expect(
      resolveAssetImageUrl({ image_url: null, category: '家電' }),
    ).toBe('/thumbs/appliance.svg');
    expect(
      resolveAssetImageUrl({ image_url: '  ', category: '楽器' }),
    ).toBe('/thumbs/instrument.svg');
  });

  it('未知カテゴリは other にフォールバック', () => {
    expect(getCategoryDefaultImage('未知')).toBe('/thumbs/other.svg');
  });
});
