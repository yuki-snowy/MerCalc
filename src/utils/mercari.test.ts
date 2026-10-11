import { describe, expect, it } from 'vitest';
import { buildMercariSearchUrl } from './mercari';

describe('buildMercariSearchUrl', () => {
  it('製品名を keyword パラメータに載せる', () => {
    const url = buildMercariSearchUrl('iPad Air');
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe('https://jp.mercari.com/search');
    expect(parsed.searchParams.get('keyword')).toBe('iPad Air');
    expect(parsed.searchParams.get('status')).toBe('sold_out');
  });

  it('前後の空白を除去する', () => {
    const url = buildMercariSearchUrl('  ギター  ');
    expect(new URL(url).searchParams.get('keyword')).toBe('ギター');
  });
});
