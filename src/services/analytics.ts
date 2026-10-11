import type { Asset } from '../types/asset';

export interface MonthlyTrendPoint {
  key: string;
  label: string;
  purchaseSpend: number;
  cumulativePurchase: number;
  cumulativeMarket: number;
  assetCount: number;
}

export interface CategoryShare {
  category: string;
  count: number;
  marketValue: number;
  purchaseValue: number;
  share: number;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return `${date.getMonth() + 1}月`;
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function assetOwnedAt(asset: Asset): Date {
  if (asset.purchase_date) {
    const parsed = new Date(asset.purchase_date);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date(asset.created_at);
}

/**
 * 直近 N ヶ月の累積保有額・当月購入額を組み立てる。
 * （履歴テーブルがないため、購入日ベースのスナップショット推定）
 */
export function buildMonthlyTrend(
  assets: Asset[],
  months = 12,
  now = new Date(),
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const from = startOfMonth(cursor);
    const to = endOfMonth(cursor);

    let purchaseSpend = 0;
    let cumulativePurchase = 0;
    let cumulativeMarket = 0;
    let assetCount = 0;

    for (const asset of assets) {
      const ownedAt = assetOwnedAt(asset);
      if (ownedAt > to) continue;

      assetCount += 1;
      cumulativePurchase += asset.purchase_price ?? 0;
      cumulativeMarket += asset.market_price ?? 0;

      if (ownedAt >= from && ownedAt <= to) {
        purchaseSpend += asset.purchase_price ?? 0;
      }
    }

    points.push({
      key: monthKey(cursor),
      label: monthLabel(cursor),
      purchaseSpend,
      cumulativePurchase,
      cumulativeMarket,
      assetCount,
    });
  }

  return points;
}

export function buildCategoryShares(assets: Asset[]): CategoryShare[] {
  const map = new Map<
    string,
    { count: number; marketValue: number; purchaseValue: number }
  >();

  for (const asset of assets) {
    const current = map.get(asset.category) ?? {
      count: 0,
      marketValue: 0,
      purchaseValue: 0,
    };
    current.count += 1;
    current.marketValue += asset.market_price ?? 0;
    current.purchaseValue += asset.purchase_price ?? 0;
    map.set(asset.category, current);
  }

  const totalMarket = [...map.values()].reduce(
    (sum, item) => sum + item.marketValue,
    0,
  );

  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      ...value,
      share: totalMarket > 0 ? value.marketValue / totalMarket : 0,
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
}
