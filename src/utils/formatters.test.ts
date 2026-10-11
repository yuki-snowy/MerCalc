import { describe, expect, it } from 'vitest';
import {
  calcValueDiff,
  formatCurrency,
  formatDate,
  formatDateTime,
  parseOptionalInt,
} from './formatters';

describe('formatCurrency', () => {
  it('金額を日本円表記にフォーマットする', () => {
    const formatted = formatCurrency(12345);
    expect(formatted).toMatch(/12,345/);
    expect(formatted).toMatch(/[¥￥]/);
  });

  it('null / undefined / NaN はダッシュを返す', () => {
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency(Number.NaN)).toBe('—');
  });
});

describe('formatDate / formatDateTime', () => {
  it('日付文字列を日本語ロケールで表示する', () => {
    expect(formatDate('2024-01-20')).toContain('2024');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('日時未設定は「未取得」を返す', () => {
    expect(formatDateTime(null)).toBe('未取得');
    expect(formatDateTime('invalid')).toBe('未取得');
    expect(formatDateTime('2024-01-20T12:00:00.000Z')).toContain('2024');
  });
});

describe('parseOptionalInt', () => {
  it('空文字や未入力は null', () => {
    expect(parseOptionalInt('')).toBeNull();
    expect(parseOptionalInt('   ')).toBeNull();
    expect(parseOptionalInt(null)).toBeNull();
  });

  it('カンマや円記号を除去して整数化する', () => {
    expect(parseOptionalInt('12,345円')).toBe(12345);
    expect(parseOptionalInt(' 9800 ')).toBe(9800);
  });
});

describe('calcValueDiff', () => {
  it('相場 - 購入価格を返す', () => {
    expect(calcValueDiff(10000, 7000)).toBe(-3000);
    expect(calcValueDiff(10000, 12000)).toBe(2000);
  });

  it('どちらか欠ける場合は null', () => {
    expect(calcValueDiff(null, 1000)).toBeNull();
    expect(calcValueDiff(1000, null)).toBeNull();
  });
});
