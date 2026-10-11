import type { Asset, AssetCategory } from '../types/asset';

/**
 * 家庭内資産向けの耐用年数目安（定額法）。
 * 税務上の法定耐用年数そのものではなく、家計管理用の一般的な目安です。
 */
export const USEFUL_LIFE_YEARS: Record<AssetCategory, number> = {
  ガジェット: 4,
  家電: 6,
  家具: 8,
  楽器: 5,
  ファッション: 3,
  ホビー: 4,
  その他: 5,
};

/** 残存価額率（購入額の 10% を下限として残す一般的な定額イメージ） */
export const RESIDUAL_RATE = 0.1;

export type DepreciationSignal = 'plus' | 'minus' | 'flat' | 'unknown';

export interface AssetDepreciation {
  usefulLifeYears: number;
  ageYears: number;
  ageLabel: string;
  bookValue: number | null;
  marketPrice: number | null;
  /** 推定相場 − 減価償却後簿価 */
  vsBook: number | null;
  signal: DepreciationSignal;
  progress: number;
}

export interface DepreciationSummary {
  totalBookValue: number;
  totalMarketValue: number;
  vsBook: number | null;
  signal: DepreciationSignal;
  comparableCount: number;
  plusCount: number;
  minusCount: number;
  flatCount: number;
}

function resolveUsefulLife(category: string): number {
  if (category in USEFUL_LIFE_YEARS) {
    return USEFUL_LIFE_YEARS[category as AssetCategory];
  }
  return USEFUL_LIFE_YEARS['その他'];
}

function ownedAt(asset: Asset): Date | null {
  if (asset.purchase_date) {
    const parsed = new Date(asset.purchase_date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const created = new Date(asset.created_at);
  return Number.isNaN(created.getTime()) ? null : created;
}

export function calcAgeYears(from: Date, now = new Date()): number {
  const ms = now.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return ms / (365.25 * 24 * 60 * 60 * 1000);
}

export function formatAgeLabel(ageYears: number): string {
  if (ageYears < 1 / 12) return '1ヶ月未満';
  if (ageYears < 1) {
    const months = Math.max(1, Math.round(ageYears * 12));
    return `約${months}ヶ月`;
  }
  const years = Math.floor(ageYears);
  const months = Math.round((ageYears - years) * 12);
  if (months === 0) return `約${years}年`;
  return `約${years}年${months}ヶ月`;
}

/**
 * 定額法:
 * 償却対象額 = 購入額 × (1 - 残存率)
 * 簿価 = max(購入額×残存率, 購入額 - 年償却額 × 経過年数)
 */
export function calcStraightLineBookValue(
  purchasePrice: number,
  ageYears: number,
  usefulLifeYears: number,
  residualRate = RESIDUAL_RATE,
): number {
  if (purchasePrice <= 0 || usefulLifeYears <= 0) return 0;

  const residualFloor = purchasePrice * residualRate;
  const depreciable = purchasePrice - residualFloor;
  const elapsed = Math.min(Math.max(ageYears, 0), usefulLifeYears);
  const book = purchasePrice - (depreciable / usefulLifeYears) * elapsed;
  return Math.max(residualFloor, Math.round(book));
}

export function signalFromDiff(diff: number | null): DepreciationSignal {
  if (diff == null) return 'unknown';
  if (diff > 0) return 'plus';
  if (diff < 0) return 'minus';
  return 'flat';
}

export function calcAssetDepreciation(
  asset: Asset,
  now = new Date(),
): AssetDepreciation {
  const usefulLifeYears = resolveUsefulLife(asset.category);
  const start = ownedAt(asset);
  const ageYears = start ? calcAgeYears(start, now) : 0;
  const purchase = asset.purchase_price;
  const market = asset.market_price;

  const bookValue =
    purchase == null
      ? null
      : calcStraightLineBookValue(purchase, ageYears, usefulLifeYears);

  const vsBook =
    bookValue == null || market == null ? null : market - bookValue;

  return {
    usefulLifeYears,
    ageYears,
    ageLabel: start ? formatAgeLabel(ageYears) : '購入日不明',
    bookValue,
    marketPrice: market,
    vsBook,
    signal: signalFromDiff(vsBook),
    progress: Math.min(1, ageYears / usefulLifeYears),
  };
}

export function buildDepreciationSummary(
  assets: Asset[],
  now = new Date(),
): DepreciationSummary {
  let totalBookValue = 0;
  let totalMarketValue = 0;
  let comparableCount = 0;
  let plusCount = 0;
  let minusCount = 0;
  let flatCount = 0;
  let vsBookSum = 0;
  let hasComparable = false;

  for (const asset of assets) {
    const dep = calcAssetDepreciation(asset, now);
    if (dep.bookValue != null) totalBookValue += dep.bookValue;
    if (dep.marketPrice != null) totalMarketValue += dep.marketPrice;

    if (dep.vsBook == null) continue;
    comparableCount += 1;
    hasComparable = true;
    vsBookSum += dep.vsBook;
    if (dep.signal === 'plus') plusCount += 1;
    else if (dep.signal === 'minus') minusCount += 1;
    else flatCount += 1;
  }

  const vsBook = hasComparable ? vsBookSum : null;

  return {
    totalBookValue,
    totalMarketValue,
    vsBook,
    signal: signalFromDiff(vsBook),
    comparableCount,
    plusCount,
    minusCount,
    flatCount,
  };
}

export const SIGNAL_LABELS: Record<DepreciationSignal, string> = {
  plus: 'プラス',
  minus: 'マイナス',
  flat: 'ほぼ同等',
  unknown: '判定不可',
};
